pragma solidity >=0.5.0 <0.7.0;

// @credit: https://github.com/status-im/account-contracts/blob/develop/contracts/cryptography/MerkleMultiProof.sol
contract MerkleMultiProof {
    function calculateMultiMerkleRoot(
        bytes32[] memory leafs,
        bytes32[] memory proofs,
        bool[] memory proofFlag
    ) public pure returns (bytes32 merkleRoot) {
        uint256 leafsLen = leafs.length;
        uint256 totalHashes = proofFlag.length;
        bytes32[] memory hashes = new bytes32[](totalHashes);
        uint leafPos = 0;
        uint hashPos = 0;
        uint proofPos = 0;
        for(uint256 i = 0; i < totalHashes; i++){
            hashes[i] = hashPair(
                proofFlag[i] ? (leafPos < leafsLen ? leafs[leafPos++] : hashes[hashPos++]) : proofs[proofPos++],
                leafPos < leafsLen ? leafs[leafPos++] : hashes[hashPos++]
            );
        }

        return hashes[totalHashes-1];
    }

    function hashPair(bytes32 a, bytes32 b) private pure returns(bytes32) {
        return a < b ? hash_node(a, b) : hash_node(b, a);
    }

    function hash_node(bytes32 left, bytes32 right) private pure returns (bytes32 hash) {
        assembly {
            mstore(0x00, left)
            mstore(0x20, right)
            hash := keccak256(0x00, 0x40)
        }
        return hash;
    }

    function verifyMultiProof(
        bytes32 root,
        bytes32[] memory leafs,
        bytes32[] memory proofs,
        bool[] memory proofFlag
    ) public pure returns (bool) {
        return calculateMultiMerkleRoot(leafs, proofs, proofFlag) == root;
    }
}