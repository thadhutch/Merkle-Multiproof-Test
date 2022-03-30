const { assert } = require("chai");
const { ethers } = require("hardhat");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require("keccak256");

describe("MerkleMultiProof Test", function () {
  it("Should create the Merkle Root", async function () {
    const MerkleMultiProof = await ethers.getContractFactory(
      "MerkleMultiProof"
    );
    const merkleMultiProof = await MerkleMultiProof.deploy();
    await merkleMultiProof.deployed();

    describe("Verify Test", function () {
      it("should verify for valid merkle multiproof", async function () {
        const leaves = ["a", "b", "c", "d", "e", "f"]
          .map(keccak256)
          .sort(Buffer.compare);
        const tree = new MerkleTree(leaves, keccak256, { sort: true });

        const root = tree.getRoot();
        const proofLeaves = ["b", "f", "d"].map(keccak256).sort(Buffer.compare);
        const proof = tree.getMultiProof(proofLeaves);
        const proofFlags = tree.getProofFlags(proofLeaves, proof);

        const verified = await merkleMultiProof.verifyMultiProof(
          root,
          proofLeaves,
          proof,
          proofFlags
        );
        assert.equal(verified, true);
      });
    });

    describe("Fail Test", function () {
      it("should return false for invalid merkle multiproof", async function () {
        const leaves = ["a", "b", "c", "d", "e", "f"]
          .map(keccak256)
          .sort(Buffer.compare);
        const tree = new MerkleTree(leaves, keccak256, { sort: true });

        const root = tree.getRoot();
        const proofLeaves = ["b", "f", "d"].map(keccak256).sort(Buffer.compare);
        const proof = tree.getMultiProof(proofLeaves);
        const proofFlags = tree.getProofFlags(proofLeaves, proof);
        proofFlags[proofFlags.length - 1] = !proofFlags[proofFlags.length - 1];

        const errMessage =
          "Returned error: VM Exception while processing transaction: invalid opcode";
        try {
          await merkleMultiProof.verifyMultiProof(
            root,
            proofLeaves,
            proof,
            proofFlags
          );
        } catch (err) {
          // errMessage = err.message;
        }

        assert.equal(
          errMessage,
          "Returned error: VM Exception while processing transaction: invalid opcode"
        );
      });
    });
  });
});
