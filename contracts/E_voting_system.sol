// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

/**
 * @title Ballot
 * @dev Implements voting process along with vote delegation
 */
contract E_voting_system {
    //variable declaration

    struct Voter_login_details {
        bytes32 pass;
        address voter;
    }

    struct Voter {
        bool is_reg;
        bool is_authorized; // is voter is authorize to vote
        bool voted; // if true, that person already voted
        uint256 vote; // index of the voted proposal
        bytes32 area; // area of voter
        uint256 Aadhar; //Aadhar card number
    }

    struct Proposal {
        // If you can limit the length to a certain number of bytes,
        // always use one of bytes1 to bytes32 because they are much cheaper
        bytes32 name; // short name (up to 32 bytes)
        bytes32 party;
        uint256 voteCount; // number of accumulated votes
    }
    struct winner_in_area {
        bytes32 name;
        uint256 voteCount;
    }

    address private chairperson;
    bytes32 private chair_pass;
    bytes32 private chair_email;

    enum voting_state {
        reg,
        validation,
        voting,
        close
    }

    voting_state private state;
    address[] voter_address;
    mapping(address => Voter) private voters;
    mapping(bytes32 => Proposal[]) public area_proposal;
    mapping(bytes32 => uint256) private reg_voter_count_per_area;
    mapping(bytes32 => uint256) private vote_count_per_area;
    mapping(bytes32 => winner_in_area) private winner_per_area;
    mapping(bytes32 => bool) private email_validation;
    mapping(uint256 => bool) private Aadhar_validation;
    mapping(bytes32 => Voter_login_details) private login_details;

    /**
     * @dev constructor create an owner an set the right to vote for the owner.
     */
    constructor(
        string memory email,
        string memory pass,
        uint256 Aadhar,
        string memory area
    ) {
        require(bytes(area).length != 0, "Please specify your area");
        chairperson = msg.sender;
        chair_email = stringToBytes32(email);
        chair_pass = stringToBytes32(pass);
        Voter memory sender;
        sender.is_authorized = true;
        sender.is_reg = true;
        sender.area = stringToBytes32(area);
        sender.Aadhar = Aadhar;
        voters[msg.sender] = sender;
        reg_voter_count_per_area[stringToBytes32(area)] += 1;
        state = voting_state.reg;
    }

    // Modifiers

    modifier Only_chairperson() {
        require(
            msg.sender == chairperson,
            "Only chairperson rights to add proposal"
        );
        require(state == voting_state.reg, "Registration is over");
        _;
    }

    modifier check_for_right(address voter) {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        require(
            state == voting_state.validation,
            "Validation process has not been started"
        );
        require(voters[voter].is_reg, "voter is not register yet");
        require(!voters[voter].voted, "The voter already voted.");
        require(!voters[voter].is_authorized,"The voter is alredy authorized");
        _;
    }

    modifier check_status(
        Voter memory voter,
        bytes32 email,
        uint256 Aadhar
    ) {
        require(state == voting_state.reg, "Registration is Over");
        require(!email_validation[email], "This Email is alredy present");
        require(
            !Aadhar_validation[Aadhar],
            "This Adhar Number is alredy preset"
        );
        require(!voter.is_reg, "You have already registered");
        _;
    }

    modifier Only_auth_non_voted_voters(
        bytes32 email,
        uint256 Aadhar,
        uint256 proposal
    ) {
        require(state == voting_state.voting, "Voting stage is not start");
        require(
            ((login_details[email].voter == msg.sender) ||
                (chair_email == email && chairperson == msg.sender)),
            "we cann't validates your account"
        );
        Voter memory sender = voters[msg.sender];
        require(sender.is_reg, "You are not register yet.");
        require(sender.is_authorized, "Has no right to vote.");
        require(!sender.voted, "Already voted.");
        require(
            sender.Aadhar == Aadhar,
            "Aadhar Number miss match please enter registered Aadhar Number."
        );
        require(
            area_proposal[sender.area].length != 0,
            "There is no proposal to vote."
        );
        require(
            area_proposal[sender.area].length >= proposal,
            "You have choose worng proposal."
        );
        _;
    }

    //event
    // event state_change(voting_state state);

    // Functions

    // This function is used by the chairperson only to add the Proposal
    function addProposal(
        string memory nme,
        string memory prty,
        string memory area
    ) public Only_chairperson {
        area_proposal[stringToBytes32(area)].push(
            Proposal({
                name: stringToBytes32(nme),
                party: stringToBytes32(prty),
                voteCount: 0
            })
        );
    }

    /**
     * @dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'.
     * @param voter address of voter
     */

    function giveRightToVote(address voter) public check_for_right(voter) {
        voters[voter].is_authorized = true;
    }

    // This function is used by the voter to register yourself
    function voter_reg(
        string memory email,
        string memory pass,
        uint256 Aadhar,
        string memory ara
    ) public check_status(voters[msg.sender], stringToBytes32(email), Aadhar) {
        voters[msg.sender] = Voter({
            is_reg: true,
            is_authorized: false,
            voted: false,
            vote: 0,
            area: stringToBytes32(ara),
            Aadhar: Aadhar
        });
        reg_voter_count_per_area[stringToBytes32(ara)] += 1;
        bytes32 em = stringToBytes32(email);
        email_validation[em] = true;
        Aadhar_validation[Aadhar] = true;
        voter_address.push(msg.sender);
        Voter_login_details memory vrdt;
        vrdt.pass = stringToBytes32(pass);
        vrdt.voter = msg.sender;
        login_details[em] = vrdt;
    }

    /**
     * @dev Give your vote (including votes delegated to you) to proposal 'proposals[proposal].name'.
     * @param proposal index of proposal in the proposals array
     */

    function vote(
        string memory email,
        uint256 Aadhar,
        uint256 proposal
    )
        public
        Only_auth_non_voted_voters(stringToBytes32(email), Aadhar, proposal)
    {
        Voter memory sender = voters[msg.sender];
        sender.voted = true;
        sender.vote = proposal;
        Proposal memory p = area_proposal[sender.area][proposal];
        p.voteCount += 1;
        area_proposal[sender.area][proposal] = p;
        voters[msg.sender] = sender;
        vote_count_per_area[sender.area] += 1;
        winner_in_area memory w = winner_per_area[sender.area];
        if (w.voteCount < p.voteCount) {
            w.name = p.name;
            w.voteCount = p.voteCount;
            winner_per_area[sender.area] = w;
        }
    }

    /**
     * @return winnerName_ the name of the winner
     */
    function winnerNME_Vcount(string memory area)
        public
        view
        returns (string memory, uint256)
    {
        require(state == voting_state.close, "Voting process not close");
        winner_in_area memory w = winner_per_area[stringToBytes32(area)];
        return (bytes32ToString(w.name), w.voteCount);
    }

    function changeState() public {
        require(
            msg.sender == chairperson,
            "Only Chairperson can change the state"
        );
        if (state == voting_state.reg) {
            state = voting_state.validation;
        } else if (state == voting_state.validation) {
            state = voting_state.voting;
        } else {
            state = voting_state.close;
        }
    }

    function changeChairperson(
        string memory newEmail,
        string memory newPass,
        address newChairperson
    ) public {
        require(
            msg.sender == chairperson,
            "Only Chairperson can assign new Chairperson"
        );
        chairperson = newChairperson;
        chair_email = stringToBytes32(newEmail);
        chair_pass = stringToBytes32(newPass);
    }

    function check_state() public view returns (voting_state st) {
        return state;
    }

    function vote_count(string memory area) public view returns (uint256) {
        return vote_count_per_area[stringToBytes32(area)];
    }

    function voter_count(string memory area) public view returns (uint256) {
        return reg_voter_count_per_area[stringToBytes32(area)];
    }

    function voterLogin(string memory email, string memory pass)
        public
        view
        returns (
            bool status,
            uint256 Aadhar,
            string memory area
        )
    {
        Voter_login_details memory v_details = login_details[
            stringToBytes32(email)
        ];
        Voter memory voter = voters[v_details.voter];
        if (v_details.pass == stringToBytes32(pass))
            return (true, voter.Aadhar, bytes32ToString(voter.area));
        else return (false, 0, "");
    }

    function unauth_voters() public view returns (address[] memory address_list,Voter[] memory voter_detils) {
        require(
            msg.sender == chairperson,
            "Only Chair person have right to call this function"
        );
        address_list = new address[](voter_address.length);
        voter_detils = new Voter[](voter_address.length);
        for(uint i=0;i<voter_address.length;i++){
            address_list[i] = voter_address[i];
            voter_detils[i] = voters[voter_address[i]];
        }
    }

    function chair_login(string memory email, string memory pass)
        private
        view
        returns (bool)
    {
        return
            chair_email == stringToBytes32(email) &&
            chair_pass == stringToBytes32(pass);
    }

    function getProposal(string memory area)
        public
        view
        returns (Proposal[] memory)
    {
        return area_proposal[stringToBytes32(area)];
    }

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }

    function bytes32ToString(bytes32 _bytes32)
        private
        pure
        returns (string memory)
    {
        uint8 i = 0;
        while (i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
}
