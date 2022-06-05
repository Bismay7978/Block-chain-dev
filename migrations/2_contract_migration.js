const E_Voting = artifacts.require("E_voting_system");
// provide constructor parameters as {email,pass,Aadhar,Area}
module.exports = function (deployer) {
    deployer.deploy(E_Voting, "ranabismaykumar@gmail.com", "BiTu@7978", 123456789012, "Remuna");
};

// address = 0x7A5BFcc387713475999507Ba738dA60F90982B0b
