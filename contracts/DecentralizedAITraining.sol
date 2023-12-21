// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DecentralizedAITraining {
    // Struct to store information about each AI model
    struct AIModel {
        string modelHash; // Hash of the model
        string modelCloudAddress; // Address of the model in the cloud
        mapping(address => uint256) contributorScores; // Map of contributor addresses to their scores
    }

    // Mapping of model IDs to their corresponding AI model data
    mapping(uint256 => AIModel) public models;

    // Address of the network admin (could be a multi-sig wallet in a real-world scenario)
    address public admin;

    // Constructor sets the initial admin of the contract
    constructor() {
        admin = msg.sender;
    }

    // Modifier to restrict functions to only admin
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function.");
        _;
    }

    // Event to emit when a new model is registered
    event ModelRegistered(uint256 modelId, string modelHash, string modelCloudAddress);

    // Event to emit when a contributor's score is updated
    event ContributorScoreUpdated(uint256 modelId, address contributor, uint256 newScore);

    // Function to register a new AI model
    function registerModel(uint256 modelId, string memory modelHash, string memory modelCloudAddress) public onlyAdmin {
        models[modelId].modelHash = modelHash;
        models[modelId].modelCloudAddress = modelCloudAddress;
        emit ModelRegistered(modelId, modelHash, modelCloudAddress);
    }

    // Function to update a contributor's score for a specific model
    function updateContributorScore(uint256 modelId, address contributor, uint256 newScore) public onlyAdmin {
        models[modelId].contributorScores[contributor] = newScore;
        emit ContributorScoreUpdated(modelId, contributor, newScore);
    }

    // Function to get the score of a contributor for a specific model
    function getContributorScore(uint256 modelId, address contributor) public view returns (uint256) {
        return models[modelId].contributorScores[contributor];
    }

    // Function to get model details
    function getModelDetails(uint256 modelId) public view returns (string memory modelHash, string memory modelCloudAddress) {
        modelHash = models[modelId].modelHash;
        modelCloudAddress = models[modelId].modelCloudAddress;
    }
}
