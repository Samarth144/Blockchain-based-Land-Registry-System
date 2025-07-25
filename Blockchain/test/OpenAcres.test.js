import { expect } from "chai";
import hardhat from "hardhat";
const { ethers } = hardhat;

describe("OpenAcres", function () {
  let contract, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("OpenAcres");
    contract = await Factory.deploy();
    // ethers v6: wait for deployment
    await contract.waitForDeployment();
  });

  it("owner can mint a land NFT", async () => {
    const uri = "ipfs://example";
    await expect(contract.mintLand(alice.address, uri))
      .to.emit(contract, "LandMinted")
      .withArgs(alice.address, 1, uri);
    expect(await contract.ownerOf(1)).to.equal(alice.address);
    expect(await contract.tokenURI(1)).to.equal(uri);
  });

  it("non-owner cannot mint", async () => {
    await expect(
      contract.connect(alice).mintLand(alice.address, "ipfs://x")
    ).to.be.reverted;
  });

  it("approved user can transfer", async () => {
    // mint to Alice
    await contract.mintLand(alice.address, "ipfs://meta");
    // Alice approves Bob
    await contract.connect(alice).approve(bob.address, 1);
    // Bob transfers
    await expect(
      contract.connect(bob).transferLand(alice.address, bob.address, 1)
    )
      .to.emit(contract, "LandTransferred")
      .withArgs(alice.address, bob.address, 1);
    expect(await contract.ownerOf(1)).to.equal(bob.address);
  });

  it("cannot transfer without approval", async () => {
    await contract.mintLand(alice.address, "ipfs://u");
    await expect(
      contract.connect(bob).transferLand(alice.address, bob.address, 1)
    ).to.be.revertedWith("Not approved or owner");
  });
});
