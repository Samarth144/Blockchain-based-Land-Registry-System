const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("LandRegistry", function () {
  let LandRegistry, landRegistry, owner, authority, alice, bob;
  const AUTHORITY_ROLE = ethers.id("AUTHORITY_ROLE");

  beforeEach(async function () {
    [owner, authority, alice, bob] = await ethers.getSigners();
    LandRegistry = await ethers.getContractFactory("LandRegistry");
    landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();
    // Grant DEFAULT_ADMIN_ROLE to the deployer (owner) and then to the authority
    await landRegistry.grantRole(await landRegistry.DEFAULT_ADMIN_ROLE(), owner.address);
    await landRegistry.grantRole(AUTHORITY_ROLE, authority.address);
  });

  describe("Deployment and Roles", function () {
    it("Should grant AUTHORITY_ROLE to the specified address", async function () {
      expect(await landRegistry.hasRole(AUTHORITY_ROLE, authority.address)).to.be.true;
    });
  });

  describe("Minting", function () {
    it("Should allow authority to mint a new land parcel", async function () {
      const tokenId = 1;
      await expect(landRegistry.connect(authority).mintLand(
        alice.address,
        "ipfs://metadata",
        "123 Main St",
        "SN123",
        1000,
        "Residential",
        50000
      )).to.emit(landRegistry, "LandMinted").withArgs(alice.address, tokenId, "SN123");

      // The LandParcel struct does not have an 'owner' field. The owner is determined by ERC721's ownerOf function.
      expect(await landRegistry.ownerOf(tokenId)).to.equal(alice.address);
      expect(await landRegistry.getTotalLands()).to.equal(1);
    });

    it("Should not allow non-authority to mint", async function () {
      await expect(landRegistry.connect(alice).mintLand(
        bob.address,
        "ipfs://metadata",
        "456 Oak Ave",
        "SN456",
        2000,
        "Commercial",
        100000
      )).to.be.reverted;
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {

        await landRegistry.connect(authority).mintLand(
            alice.address, "ipfs://metadata", "123 Main St", "SN123", 1000, "Residential", 50000
        );
    });

    it("Should allow owner to transfer land", async function () {
        await expect(landRegistry.connect(alice).transferLand(alice.address, bob.address, 1))
            .to.emit(landRegistry, "LandTransferred")
            .withArgs(alice.address, bob.address, 1);
        expect(await landRegistry.ownerOf(1)).to.equal(bob.address);
    });

    it("Should not allow transfer if there is an active dispute", async function () {
        await landRegistry.connect(authority).updateDisputeStatus(1, true, "Boundary issue");
        await expect(landRegistry.connect(alice).transferLand(alice.address, bob.address, 1))
            .to.be.revertedWith("Land has an active dispute");
    });
  });

  describe("Disputes", function () {
    beforeEach(async function () {
        await landRegistry.connect(authority).mintLand(
            alice.address, "ipfs://metadata", "123 Main St", "SN123", 1000, "Residential", 50000
        );
    });

    it("Should allow authority to raise and resolve disputes", async function () {
        await expect(landRegistry.connect(authority).updateDisputeStatus(1, true, "Ownership claim"))
            .to.emit(landRegistry, "DisputeStatusUpdated").withArgs(1, true, "Ownership claim");
        expect(await landRegistry.hasActiveDispute(1)).to.be.true;

        await expect(landRegistry.connect(authority).updateDisputeStatus(1, false, ""))
            .to.emit(landRegistry, "DisputeStatusUpdated").withArgs(1, false, "");
        expect(await landRegistry.hasActiveDispute(1)).to.be.false;
    });
  });

  describe("Market Value", function () {
    beforeEach(async function () {
        await landRegistry.connect(authority).mintLand(
            alice.address, "ipfs://metadata", "123 Main St", "SN123", 1000, "Residential", 50000
        );
    });

    it("Should allow authority to update market value", async function () {
        await expect(landRegistry.connect(authority).updateMarketValue(1, 60000))
            .to.emit(landRegistry, "MarketValueUpdated").withArgs(1, 50000, 60000, anyValue);
        expect(await landRegistry.getCurrentMarketValue(1)).to.equal(60000);
    });
  });

  describe("Batch Operations", function () {
    it("Should allow authority to batch mint lands", async function () {

        const params = [
            {
                recipient: alice.address,
                metadataURI: "ipfs://meta1",
                location: "Street 1",
                surveyNumber: "SN1",
                area: 100,
                propertyType: "Type1",
                marketValue: 1000
            },
            {
                recipient: bob.address,
                metadataURI: "ipfs://meta2",
                location: "Street 2",
                surveyNumber: "SN2",
                area: 200,
                propertyType: "Type2",
                marketValue: 2000
            }
        ];
        await landRegistry.connect(authority).batchMintLand(params); // The params array is already correctly structured for the BatchMintParams struct.
        expect(await landRegistry.getTotalLands()).to.equal(2);
        expect(await landRegistry.ownerOf(1)).to.equal(alice.address);
        expect(await landRegistry.ownerOf(2)).to.equal(bob.address);
    });
  });
});
