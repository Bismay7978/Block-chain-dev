const e_voting = artifacts.require('E_voting_system');

contract('E_voting_system', (account) => {
    before(async () => {
        this.e_vot = await e_voting.deployed();
    })

    it('deploy sucessful', async () => {
        const address = this.e_vot.address;
        assert.notEqual(address, 0x0);
        assert.notEqual(address, '');
        assert.notEqual(address, null);
        assert.notEqual(address, undefined);
    })
    it('change state', async () => {
        const result = await this.e_vot.changeState();
        // const state = result.logs[0].args
        console.log(result);
    })

    it('Voting', async () => {
        const result = await this.e_vot.vote("ranabismaykumar@gmail.com", 123456789012, 0).then((msg) => {
            console.log(msg);
        });
        console.log(result);
    })
})