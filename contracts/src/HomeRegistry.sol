// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title HomeRegistry
/// @notice On-chain property desk for Arc: tokenize a home, list it for sale or for
///         rent, and settle in native USDC.
/// @dev An entry here is a record with an owner, not legal title to anything. The
///      contract cannot check `name` or `location` against the real world. See SPEC.md.
contract HomeRegistry {
    uint64 public constant LEASE_TERM = 30 days;

    struct Home {
        address owner;
        uint64 leaseEnd;
        bool forSale;
        bool forRent;
        address tenant;
        uint256 salePrice;
        uint256 rentPrice;
        string name;
        string location;
    }

    /// @notice Number of homes tokenized so far. Ids run from 1 to homeCount.
    uint256 public homeCount;

    mapping(uint256 => Home) private homes;

    event HomeTokenized(uint256 indexed homeId, address indexed owner, string name, string location);
    event ListedForSale(uint256 indexed homeId, uint256 price);
    event ListedForRent(uint256 indexed homeId, uint256 rentPrice);
    event Delisted(uint256 indexed homeId);
    event HomeSold(uint256 indexed homeId, address indexed seller, address indexed buyer, uint256 price);
    event HomeRented(uint256 indexed homeId, address indexed tenant, uint256 amount, uint64 leaseEnd);
    event RentPaid(uint256 indexed homeId, address indexed tenant, uint256 amount, uint64 leaseEnd);
    event LeaseEnded(uint256 indexed homeId, address indexed tenant, address indexed endedBy);

    error EmptyMetadata();
    error UnknownHome();
    error NotHomeOwner();
    error InvalidPrice();
    error HomeIsLeased();
    error NotForSale();
    error NotForRent();
    error IncorrectPayment(uint256 expected, uint256 sent);
    error NotTenant();
    error NoActiveLease();
    error LeaseNotExpired();
    error PayoutFailed();

    modifier onlyHomeOwner(uint256 homeId) {
        if (_home(homeId).owner != msg.sender) revert NotHomeOwner();
        _;
    }

    function tokenizeHome(string calldata name, string calldata location) external returns (uint256 homeId) {
        if (bytes(name).length == 0 || bytes(location).length == 0) revert EmptyMetadata();

        homeId = ++homeCount;

        Home storage home = homes[homeId];
        home.owner = msg.sender;
        home.name = name;
        home.location = location;

        emit HomeTokenized(homeId, msg.sender, name, location);
    }

    function listForSale(uint256 homeId, uint256 price) external onlyHomeOwner(homeId) {
        if (price == 0) revert InvalidPrice();

        Home storage home = homes[homeId];
        if (_leaseActive(home)) revert HomeIsLeased();

        home.forSale = true;
        home.salePrice = price;

        emit ListedForSale(homeId, price);
    }

    function listForRent(uint256 homeId, uint256 rentPrice) external onlyHomeOwner(homeId) {
        if (rentPrice == 0) revert InvalidPrice();

        Home storage home = homes[homeId];
        // The rent a sitting tenant renews at must not move under them.
        if (_leaseActive(home)) revert HomeIsLeased();

        home.forRent = true;
        home.rentPrice = rentPrice;

        emit ListedForRent(homeId, rentPrice);
    }

    function delist(uint256 homeId) external onlyHomeOwner(homeId) {
        Home storage home = homes[homeId];
        if (_leaseActive(home)) revert HomeIsLeased();

        home.forSale = false;
        home.salePrice = 0;
        home.forRent = false;
        home.rentPrice = 0;

        emit Delisted(homeId);
    }

    function buy(uint256 homeId) external payable {
        Home storage home = _home(homeId);
        if (!home.forSale) revert NotForSale();
        if (_leaseActive(home)) revert HomeIsLeased();
        if (msg.value != home.salePrice) revert IncorrectPayment(home.salePrice, msg.value);

        address seller = home.owner;
        uint256 price = home.salePrice;

        home.owner = msg.sender;
        home.forSale = false;
        home.salePrice = 0;
        home.forRent = false;
        home.rentPrice = 0;
        home.tenant = address(0);
        home.leaseEnd = 0;

        _payout(seller, price);

        emit HomeSold(homeId, seller, msg.sender, price);
    }

    function rent(uint256 homeId) external payable {
        Home storage home = _home(homeId);
        if (!home.forRent) revert NotForRent();
        if (_leaseActive(home)) revert HomeIsLeased();
        if (msg.value != home.rentPrice) revert IncorrectPayment(home.rentPrice, msg.value);

        address landlord = home.owner;
        uint64 leaseEnd = uint64(block.timestamp) + LEASE_TERM;

        home.tenant = msg.sender;
        home.leaseEnd = leaseEnd;
        // A rented home comes off the sale board until the lease is over.
        home.forSale = false;
        home.salePrice = 0;

        _payout(landlord, msg.value);

        emit HomeRented(homeId, msg.sender, msg.value, leaseEnd);
    }

    function payRent(uint256 homeId) external payable {
        Home storage home = _home(homeId);
        if (home.tenant != msg.sender) revert NotTenant();
        if (home.rentPrice == 0) revert NotForRent();
        if (msg.value != home.rentPrice) revert IncorrectPayment(home.rentPrice, msg.value);

        // Paying early stacks a term onto the end of the lease; paying after it has
        // lapsed starts a fresh term today rather than backdating one.
        uint64 base = _leaseActive(home) ? home.leaseEnd : uint64(block.timestamp);
        uint64 leaseEnd = base + LEASE_TERM;

        address landlord = home.owner;
        home.leaseEnd = leaseEnd;

        _payout(landlord, msg.value);

        emit RentPaid(homeId, msg.sender, msg.value, leaseEnd);
    }

    function endLease(uint256 homeId) external {
        Home storage home = _home(homeId);

        address tenant = home.tenant;
        if (tenant == address(0)) revert NoActiveLease();
        if (msg.sender != tenant && msg.sender != home.owner) revert NotTenant();
        // The tenant may walk away early and forfeit the rest of the term. The
        // landlord has to wait the lease out.
        if (msg.sender != tenant && _leaseActive(home)) revert LeaseNotExpired();

        home.tenant = address(0);
        home.leaseEnd = 0;

        emit LeaseEnded(homeId, tenant, msg.sender);
    }

    function getHome(uint256 homeId) external view returns (Home memory) {
        return _home(homeId);
    }

    function isLeaseActive(uint256 homeId) external view returns (bool) {
        return _leaseActive(_home(homeId));
    }

    function _home(uint256 homeId) private view returns (Home storage home) {
        home = homes[homeId];
        if (home.owner == address(0)) revert UnknownHome();
    }

    function _leaseActive(Home storage home) private view returns (bool) {
        return home.leaseEnd > block.timestamp;
    }

    function _payout(address to, uint256 amount) private {
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert PayoutFailed();
    }
}
