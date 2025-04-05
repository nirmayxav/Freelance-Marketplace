// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReviewContract {
    struct Review {
        address reviewer;
        string comment;
        uint8 rating;
        uint256 timestamp;
    }

    mapping(address => Review[]) public reviews;

    function addReview(address freelancer, string memory comment, uint8 rating) public {
        require(rating >= 1 && rating <= 5, "Rating must be 1 to 5");

        reviews[freelancer].push(Review({
            reviewer: msg.sender,
            comment: comment,
            rating: rating,
            timestamp: block.timestamp
        }));
    }

    function getReviews(address freelancer) public view returns (Review[] memory) {
        return reviews[freelancer];
    }
}
