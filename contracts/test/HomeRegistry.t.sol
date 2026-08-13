// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {HomeRegistry} from "../src/HomeRegistry.sol";

contract HomeRegistryTest is Test {
    HomeRegistry internal registry;

    address internal landlord = makeAddr("landlord");
    address internal buyer = makeAddr("buyer");
    address internal tenant = makeAddr("tenant");
    address internal stranger = makeAddr("stranger");

    // Native USDC on Arc is 18-decimal, so these read as 250,000 and 1,200 USDC.
    uint256 internal constant SALE_PRICE = 250_000e18;
    uint256 internal constant RENT_PRICE = 1_200e18;

    string internal constant NAME = "Sea view flat";
    string internal constant LOCATION = "Kadikoy, Istanbul";

    function setUp() public {
        registry = new HomeRegistry();
        vm.deal(buyer, 1_000_000e18);
        vm.deal(tenant, 10_000e18);
    }

    function _tokenize() internal returns (uint256 homeId) {
        vm.prank(landlord);
        homeId = registry.tokenizeHome(NAME, LOCATION);
    }

    function _listedForSale() internal returns (uint256 homeId) {
        homeId = _tokenize();
        vm.prank(landlord);
        registry.listForSale(homeId, SALE_PRICE);
    }

    function _listedForRent() internal returns (uint256 homeId) {
        homeId = _tokenize();
        vm.prank(landlord);
        registry.listForRent(homeId, RENT_PRICE);
    }

    function _leased() internal returns (uint256 homeId) {
        homeId = _listedForRent();
        vm.prank(tenant);
        registry.rent{value: RENT_PRICE}(homeId);
    }

    // --- tokenize ---

    function test_TokenizeStoresOwnerAndMetadata() public {
        vm.expectEmit(true, true, false, true);
        emit HomeRegistry.HomeTokenized(1, landlord, NAME, LOCATION);
        uint256 homeId = _tokenize();

        assertEq(homeId, 1);
        assertEq(registry.homeCount(), 1);

        HomeRegistry.Home memory home = registry.getHome(homeId);
        assertEq(home.owner, landlord);
        assertEq(home.name, NAME);
        assertEq(home.location, LOCATION);
        assertFalse(home.forSale);
        assertFalse(home.forRent);
        assertEq(home.tenant, address(0));
        assertEq(home.leaseEnd, 0);
    }

    function test_TokenizeRevertsOnEmptyName() public {
        vm.prank(landlord);
        vm.expectRevert(HomeRegistry.EmptyMetadata.selector);
        registry.tokenizeHome("", LOCATION);
    }

    function test_TokenizeRevertsOnEmptyLocation() public {
        vm.prank(landlord);
        vm.expectRevert(HomeRegistry.EmptyMetadata.selector);
        registry.tokenizeHome(NAME, "");
    }

    function test_GetHomeRevertsOnUnknownId() public {
        vm.expectRevert(HomeRegistry.UnknownHome.selector);
        registry.getHome(42);
    }

    // --- sale ---

    function test_BuyMovesOwnershipAndPaysSeller() public {
        uint256 homeId = _listedForSale();
        uint256 sellerBefore = landlord.balance;

        vm.prank(buyer);
        registry.buy{value: SALE_PRICE}(homeId);

        HomeRegistry.Home memory home = registry.getHome(homeId);
        assertEq(home.owner, buyer);
        assertFalse(home.forSale);
        assertEq(home.salePrice, 0);
        assertEq(landlord.balance, sellerBefore + SALE_PRICE);
        assertEq(address(registry).balance, 0);
    }

    function test_BuyRevertsOnWrongPayment() public {
        uint256 homeId = _listedForSale();

        vm.prank(buyer);
        vm.expectRevert(
            abi.encodeWithSelector(HomeRegistry.IncorrectPayment.selector, SALE_PRICE, SALE_PRICE - 1)
        );
        registry.buy{value: SALE_PRICE - 1}(homeId);
    }

    function test_BuyRevertsWhenNotListed() public {
        uint256 homeId = _tokenize();

        vm.prank(buyer);
        vm.expectRevert(HomeRegistry.NotForSale.selector);
        registry.buy{value: SALE_PRICE}(homeId);
    }

    function test_ListForSaleRevertsForNonOwner() public {
        uint256 homeId = _tokenize();

        vm.prank(stranger);
        vm.expectRevert(HomeRegistry.NotHomeOwner.selector);
        registry.listForSale(homeId, SALE_PRICE);
    }

    function test_TenantBlocksListingForSale() public {
        uint256 homeId = _leased();

        vm.prank(landlord);
        vm.expectRevert(HomeRegistry.HomeIsLeased.selector);
        registry.listForSale(homeId, SALE_PRICE);
    }

    function test_CannotBuyOnceHomeIsLeased() public {
        uint256 homeId = _tokenize();
        vm.startPrank(landlord);
        registry.listForSale(homeId, SALE_PRICE);
        registry.listForRent(homeId, RENT_PRICE);
        vm.stopPrank();

        vm.prank(tenant);
        registry.rent{value: RENT_PRICE}(homeId);

        vm.prank(buyer);
        vm.expectRevert(HomeRegistry.NotForSale.selector);
        registry.buy{value: SALE_PRICE}(homeId);
    }

    // --- rent ---

    function test_RentStartsLeaseAndPaysLandlord() public {
        uint256 homeId = _listedForRent();
        uint256 landlordBefore = landlord.balance;

        vm.prank(tenant);
        registry.rent{value: RENT_PRICE}(homeId);

        HomeRegistry.Home memory home = registry.getHome(homeId);
        assertEq(home.tenant, tenant);
        assertEq(home.leaseEnd, uint64(block.timestamp) + registry.LEASE_TERM());
        assertTrue(registry.isLeaseActive(homeId));
        assertEq(landlord.balance, landlordBefore + RENT_PRICE);
        assertEq(address(registry).balance, 0);
    }

    function test_RentRevertsWhenAlreadyLeased() public {
        uint256 homeId = _leased();

        vm.deal(stranger, RENT_PRICE);
        vm.prank(stranger);
        vm.expectRevert(HomeRegistry.HomeIsLeased.selector);
        registry.rent{value: RENT_PRICE}(homeId);
    }

    function test_PayRentStacksOnTopOfARunningLease() public {
        uint256 homeId = _leased();
        uint64 firstEnd = registry.getHome(homeId).leaseEnd;

        skip(10 days);
        vm.prank(tenant);
        registry.payRent{value: RENT_PRICE}(homeId);

        assertEq(registry.getHome(homeId).leaseEnd, firstEnd + registry.LEASE_TERM());
    }

    function test_PayRentAfterExpiryStartsAFreshTerm() public {
        uint256 homeId = _leased();

        skip(40 days);
        assertFalse(registry.isLeaseActive(homeId));

        vm.prank(tenant);
        registry.payRent{value: RENT_PRICE}(homeId);

        assertEq(registry.getHome(homeId).leaseEnd, uint64(block.timestamp) + registry.LEASE_TERM());
    }

    function test_PayRentRevertsForNonTenant() public {
        uint256 homeId = _leased();

        vm.deal(stranger, RENT_PRICE);
        vm.prank(stranger);
        vm.expectRevert(HomeRegistry.NotTenant.selector);
        registry.payRent{value: RENT_PRICE}(homeId);
    }

    // --- lease end ---

    function test_TenantCanEndLeaseEarly() public {
        uint256 homeId = _leased();

        vm.prank(tenant);
        registry.endLease(homeId);

        HomeRegistry.Home memory home = registry.getHome(homeId);
        assertEq(home.tenant, address(0));
        assertEq(home.leaseEnd, 0);
    }

    function test_LandlordMustWaitOutTheLease() public {
        uint256 homeId = _leased();

        vm.prank(landlord);
        vm.expectRevert(HomeRegistry.LeaseNotExpired.selector);
        registry.endLease(homeId);

        skip(31 days);
        vm.prank(landlord);
        registry.endLease(homeId);

        assertEq(registry.getHome(homeId).tenant, address(0));
    }

    function test_SaleUnlocksAfterLeaseEnds() public {
        uint256 homeId = _leased();

        vm.prank(tenant);
        registry.endLease(homeId);

        vm.prank(landlord);
        registry.listForSale(homeId, SALE_PRICE);

        vm.prank(buyer);
        registry.buy{value: SALE_PRICE}(homeId);

        assertEq(registry.getHome(homeId).owner, buyer);
    }
}
