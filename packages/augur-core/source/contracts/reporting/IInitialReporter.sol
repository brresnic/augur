pragma solidity 0.5.4;

import 'ROOT/reporting/IReportingParticipant.sol';
import 'ROOT/reporting/IMarket.sol';
import 'ROOT/IAugur.sol';


contract IInitialReporter is IReportingParticipant {
    function initialize(IAugur _augur, IMarket _market, address _designatedReporter) public returns (bool);
    function report(address _reporter, bytes32 _payoutDistributionHash, uint256[] memory _payoutNumerators, uint256 _initialReportStake) public returns (bool);
    function designatedReporterShowed() public view returns (bool);
    function designatedReporterWasCorrect() public view returns (bool);
    function getDesignatedReporter() public view returns (address);
    function getReportTimestamp() public view returns (uint256);
    function migrateToNewUniverse(address _designatedReporter) public returns (bool);
    function returnRepFromDisavow() public returns (bool);
}
