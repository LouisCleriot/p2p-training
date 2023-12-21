// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedAITraining {

    struct AIModel {
        string modelHash;
        string modelCloudAddress;
        mapping(address => uint256) contributorScores;
    }

    mapping(uint256 => AIModel) public models;

    address public admin;

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    event ModelRegistered(uint256 modelId, string modelHash, string modelCloudAddress);

    event ContributorScoreUpdated(uint256 modelId, address contributor, uint256 newScore);

    function registerModel(uint256 modelId, string memory modelHash, string memory modelCloudAddress) public onlyAdmin {
        models[modelId].modelHash = modelHash;
        models[modelId].modelCloudAddress = modelCloudAddress;
        emit ModelRegistered(modelId, modelHash, modelCloudAddress);
    }

    function updateContributorScore(uint256 modelId, address contributor, uint256 newScore) public onlyAdmin {
        models[modelId].contributorScores[contributor] = newScore;
        emit ContributorScoreUpdated(modelId, contributor, newScore);
    }

    function getContributorScore(uint256 modelId, address contributor) public view returns (uint256) {
        return models[modelId].contributorScores[contributor];
    }

    function getModelDetails(uint256 modelId) public view returns (string memory modelHash, string memory modelCloudAddress) {
        modelHash = models[modelId].modelHash;
        modelCloudAddress = models[modelId].modelCloudAddress;
    }
}
