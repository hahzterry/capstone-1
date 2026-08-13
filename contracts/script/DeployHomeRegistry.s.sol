// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {HomeRegistry} from "../src/HomeRegistry.sol";

contract DeployHomeRegistry is Script {
    function run() external returns (HomeRegistry registry) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerKey);
        registry = new HomeRegistry();
        vm.stopBroadcast();

        console.log("HomeRegistry:", address(registry));
    }
}
