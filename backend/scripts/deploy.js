const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Escrow contract
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    "0xD5a19F394FBF1fF718b57232D014b62Ed9B77Db4",
    { value: hre.ethers.parseEther("0.0005") }
  );
  await escrow.waitForDeployment();
  console.log("✅ Escrow contract deployed to:", await escrow.getAddress());

  // Deploy ReviewContract
  const ReviewContract = await hre.ethers.getContractFactory("ReviewContract");
  const review = await ReviewContract.deploy();
  await review.waitForDeployment();
  console.log("✅ ReviewContract deployed to:", await review.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment error:", error);
  process.exit(1);
});
