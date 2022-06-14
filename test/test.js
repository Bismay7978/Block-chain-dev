const e_voting = artifacts.require('E_voting_system');

contract('E_voting_system', (accounts) => {
    before(async () => {
        this.e_vot = await e_voting.deployed();
    })

    it('deploy sucessful', async () => {
        const address = this.e_vot.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
        console.log(accounts);
    })
    it('change state_1', async () => {
        try {
            const result = await this.e_vot.changeState({ from: accounts[1] });
            // const state = result.logs[0].args
            console.log(result);
        }
        catch (error) {
            error = String(error);
            index = error.indexOf("Reason given:");
            index += 13;
            submsg = error.substring(index, error.length - 1);
            console.log(submsg);
        }
    })


    it('Voting', async () => {
        try {
            const result = await this.e_vot.vote("ranabismaykumar@gmail.com", 123456789012, 0);
            console.log(result);
        }
        catch (error) {
            error = String(error);
            index = error.indexOf("Reason given:");
            index += 13;
            submsg = error.substring(index, error.length - 1);
            console.log(submsg);
        }
    })
})