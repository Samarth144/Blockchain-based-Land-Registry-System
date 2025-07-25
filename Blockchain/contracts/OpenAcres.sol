// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract OpenAcres is ERC721URIStorage, AccessControl {
    bytes32 public constant AUTHORITY_ROLE = keccak256("AUTHORITY_ROLE");
    uint256 private _nextTokenId;

    struct LandParcel {
        string location;
        string surveyNumber;
        uint256 area;
        string propertyType;
        uint256 marketValue;
        bool hasDispute;
        string disputeDetails;
        uint256 lastTransferDate;
        string ownershipHistory;
        string valueHistory;
    }

    mapping(uint256 => LandParcel) public landParcels;

    event LandMinted(address indexed to, uint256 indexed tokenId, string surveyNumber);
    event LandTransferred(address indexed from, address indexed to, uint256 indexed tokenId);
    event DisputeStatusUpdated(uint256 indexed tokenId, bool hasDispute, string details);
    event MarketValueUpdated(uint256 indexed tokenId, uint256 oldValue, uint256 newValue, uint256 timestamp);

    // Minimum area in square meters
    uint256 public constant MIN_AREA = 1;
    // Maximum area in square meters (10 million sq meters = 10 sq km)
    uint256 public constant MAX_AREA = 10000000;
    constructor() ERC721("OpenAcres", "LAND") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
    }

    function getTokenIdCounter() public view returns (uint256) {
        return _nextTokenId;
    }

    /// @notice Batch mint multiple land NFTs
    /// @param recipients Array of addresses that will own the land NFTs
    /// @param metadataURIs Array of IPFS URIs containing land metadata
    /// @param locations Array of physical location descriptions
    /// @param surveyNumbers Array of official survey numbers
    /// @param areas Array of land areas in square meters
    /// @param propertyTypes Array of property types
    /// @param marketValues Array of initial market values in wei
    /// @return uint256[] Array of newly minted token IDs
    struct BatchMintParams {
        address recipient;
        string location;
        string surveyNumber;
        uint256 area;
        string propertyType;
        uint256 marketValue;
    }

    function batchMintLand(
        BatchMintParams[] calldata params
    ) external onlyRole(AUTHORITY_ROLE) returns (uint256[] memory) {
        uint256 batchSize = params.length;
        require(batchSize > 0, "Empty batch");

        uint256[] memory newTokenIds = new uint256[](batchSize);
        
        for(uint256 i = 0; i < batchSize; i++) {
            newTokenIds[i] = mintLand(
                params[i].recipient,
                params[i].location,
                params[i].surveyNumber,
                params[i].area,
                params[i].propertyType,
                params[i].marketValue
            );        }
        
        return newTokenIds;
    }

    /// @notice Mints a new land NFT with complete property details
    /// @param to Address that will own the land NFT
    /// @param location Physical location description
    /// @param surveyNumber Official survey number
    /// @param area Land area in square meters
    /// @param propertyType Type of property (e.g., "Residential", "Commercial")
    /// @param marketValue Initial market value in wei
    /// @return uint256 ID of the newly minted token
    function mintLand(
        address to,
        string calldata location,
        string calldata surveyNumber,
        uint256 area,
        string calldata propertyType,
        uint256 marketValue
    ) public onlyRole(AUTHORITY_ROLE) returns (uint256) {
        require(to != address(0), "Invalid recipient address");
        require(bytes(location).length > 0, "Location cannot be empty");
        require(bytes(surveyNumber).length > 0, "Survey number cannot be empty");
        require(area >= MIN_AREA && area <= MAX_AREA, "Invalid area size");
        require(bytes(propertyType).length > 0, "Property type cannot be empty");
        require(marketValue > 0, "Market value must be positive");
        _nextTokenId++;
        uint256 newId = _nextTokenId;
        
        _safeMint(to, newId);
        
        string memory initialValueHistory = string.concat(
            "Initial value: ",
            uint256ToString(marketValue)
        );
        landParcels[newId] = LandParcel({
            location: location,
            surveyNumber: surveyNumber,
            area: area,
            propertyType: propertyType,
            marketValue: marketValue,
            hasDispute: false,
            disputeDetails: "",
            lastTransferDate: block.timestamp,
            ownershipHistory: "",
            valueHistory: ""
        });

        landParcels[newId].ownershipHistory = string.concat("Minted to: ", addressToString(to));
        landParcels[newId].valueHistory = initialValueHistory;

        emit LandMinted(to, newId, surveyNumber);
        return newId;
    }

    function addressToString(address _addr) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2+i*2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3+i*2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /// @notice Batch transfer multiple land parcels
    /// @param froms Array of current owner addresses
    /// @param tos Array of recipient addresses
    /// @param tokenIds Array of land token IDs
    function batchTransferLand(
        address[] calldata froms,
        address[] calldata tos,
        uint256[] calldata tokenIds
    ) external {
        require(froms.length == tos.length && froms.length == tokenIds.length, "Array lengths mismatch");
        require(froms.length > 0, "Empty batch");
        
        for(uint256 i = 0; i < froms.length; i++) {
            transferLand(froms[i], tos[i], tokenIds[i]);
        }
    }

    function transferLand(address from, address to, uint256 tokenId) public {
        require(!landParcels[tokenId].hasDispute, "Land has an active dispute");
        require(
            ownerOf(tokenId) == _msgSender() || getApproved(tokenId) == _msgSender(),
            "Not approved or owner"
        );
        
        _transfer(from, to, tokenId);
        
        // Update ownership history and transfer date
        landParcels[tokenId].lastTransferDate = block.timestamp;
        // Create transfer record string in memory to save gas
        string memory transferRecord = string.concat(
            ", Transferred from: ",
            addressToString(from),
            " to: ",
            addressToString(to)
        );
        
        landParcels[tokenId].ownershipHistory = string.concat(
            landParcels[tokenId].ownershipHistory,
            transferRecord
        );
        
        emit LandTransferred(from, to, tokenId);
    }

    function updateDisputeStatus(
        uint256 tokenId,
        bool hasDispute,
        string calldata details
    ) external onlyRole(AUTHORITY_ROLE) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        
        landParcels[tokenId].hasDispute = hasDispute;
        landParcels[tokenId].disputeDetails = details;
        
        emit DisputeStatusUpdated(tokenId, hasDispute, details);
    }

    function uint256ToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    /// @notice Batch update market values for multiple land parcels
    /// @param tokenIds Array of land token IDs
    /// @param newValues Array of new market values in wei
    function batchUpdateMarketValue(
        uint256[] calldata tokenIds,
        uint256[] calldata newValues
    ) external onlyRole(AUTHORITY_ROLE) {
        require(tokenIds.length == newValues.length, "Array lengths mismatch");
        require(tokenIds.length > 0, "Empty batch");
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            updateMarketValue(tokenIds[i], newValues[i]);
        }
    }

    /// @notice Updates the market value of a land parcel
    /// @param tokenId ID of the land token
    /// @param newValue New market value in wei
    function updateMarketValue(uint256 tokenId, uint256 newValue) public onlyRole(AUTHORITY_ROLE) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        require(newValue > 0, "Market value must be positive");
        
        uint256 oldValue = landParcels[tokenId].marketValue;
        landParcels[tokenId].marketValue = newValue;
        landParcels[tokenId].valueHistory = string.concat(
            landParcels[tokenId].valueHistory,
            ", Updated to: ",
            uint256ToString(newValue),
            " at: ",
            uint256ToString(block.timestamp)
        );
        
        emit MarketValueUpdated(tokenId, oldValue, newValue, block.timestamp);
    }



    /// @notice Retrieves complete information about a land parcel
    /// @param tokenId ID of the land token
    /// @return LandParcel struct containing all land information
    function getLandParcel(uint256 tokenId) external view returns (LandParcel memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return landParcels[tokenId];
    }

    /// @notice Get the total number of land parcels minted
    /// @return uint256 Total number of tokens
    function getTotalLands() external view returns (uint256) {
        return _nextTokenId;
    }

    /// @notice Check if a land parcel has any active disputes
    /// @param tokenId ID of the land token
    /// @return bool True if the land has an active dispute
    function hasActiveDispute(uint256 tokenId) external view returns (bool) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return landParcels[tokenId].hasDispute;
    }

    /// @notice Get the current market value of a land parcel
    /// @param tokenId ID of the land token
    /// @return uint256 Current market value in wei
    function getCurrentMarketValue(uint256 tokenId) external view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return landParcels[tokenId].marketValue;
    }

    /// @notice Get the complete transfer history of a land parcel
    /// @param tokenId ID of the land token
    /// @return string Formatted ownership history
    function getOwnershipHistory(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return landParcels[tokenId].ownershipHistory;
    }

    /// @notice Get the complete value history of a land parcel
    /// @param tokenId ID of the land token
    /// @return string Formatted value history
    function getValueHistory(uint256 tokenId) external view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return landParcels[tokenId].valueHistory;
    }

    // Override required by Solidity
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}