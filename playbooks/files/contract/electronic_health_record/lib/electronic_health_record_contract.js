'use strict';

const { Contract } = require('fabric-contract-api');
const Utils = require('./utils');
const Profile = require('./profile');
const Ehr = require('./ehr');
const sha512 = require('js-sha512');
const seeds = require('./seeds.json');

class ElectronicHealthRecordContract extends Contract {
    async initLedger(ctx) {
        for (let [key, value] of Object.entries(seeds.allProfile)) {
            const ssn = key;
            const profile = Profile.fromJSON(value);
            console.info(JSON.stringify(profile));
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);
        }
        for (let [key, value] of Object.entries(seeds.allUsedEhr)) {
            const ehrId = key;
            const ehr = Ehr.fromJSON(JSON.parse(value));
            console.info(ehr);
            const buffer = Buffer.from(JSON.stringify(ehr));
            await ctx.stub.putState(ehrId, buffer);
        }
    }

    async readProfile(ctx, ssn, key) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashKey = sha512(key);
        if (hashKey === profile.hashKey) {
            return profile;
        }
    }

    async grantProfileAccess(ctx, ssn, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashKey = sha512(key);
        if (hashKey === profile.hashKey) {
            profile.grantProfileAccess(hashKey, actorId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);
            return profile;
        }
    }

    async revokeProfileAccess(ctx, ssn, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashKey = sha512(key);
        if (hashKey === profile.hashKey) {
            profile.revokeProfileAccess(hashKey, actorId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);
            return profile;
        }
    }

    async grantEHRAccess(ctx, ssn, ehrId, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashKey = sha512(key);
        if (hashKey === profile.hashKey) {
            profile.grantEHRAccess(hashKey, actorId, ehrId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);

            let ehrBuffer = await ctx.stub.getState(ehrId);
            const ehr = Utils.handleStateQueryResult(ehrBuffer);
            ehr.addToAccessList(actorId);
            ehrBuffer = Buffer.from(JSON.stringify(ehr));
            await ctx.stub.putState(ehrId, ehrBuffer);
        }
    }

    async revokeEHRAccess(ctx, ssn, ehrId, key, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        const hashKey = sha512(key);
        if (hashKey === profile.hashKey) {
            profile.revokeEHRAccess(hashKey, actorId, ehrId);
            const buffer = Buffer.from(JSON.stringify(profile));
            await ctx.stub.putState(ssn, buffer);

            let ehrBuffer = await ctx.stub.getState(ehrId);
            const ehr = Utils.handleStateQueryResult(ehrBuffer);
            ehr.removeFromAccessList(actorId);
            ehrBuffer = Buffer.from(JSON.stringify(ehr));
            await ctx.stub.putState(ehrId, ehrBuffer);
        }
    }

    async viewPartialProfile(ctx, ssn, actorId) {
        const buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        return profile.viewPartialProfile(actorId);
    }

    async addEHR(ctx, ssn, actorId, ehr, ehrId) {
        // check if ehrId does not exist in world-state
        const ehrCheck = await ctx.stub.getState(ehrId);
        if (!!ehrCheck && ehrCheck.length > 0) {
            console.info(`EHR with id ${ehrId} already exists`);
            // throw new Error(`EHR with id ${ehrId} already exists`);
        }
        // add the actor supplying the ehr to the access list
        const ehrObj = Ehr.fromJSON(JSON.parse(ehr));
        ehrObj.addToAccessList(actorId);
        const ehrBuffer = Buffer.from(JSON.stringify(ehrObj));
        await ctx.stub.putState(ehrId, ehrBuffer);

        let buffer = await ctx.stub.getState(ssn);
        const profile = Utils.handleStateQueryResult(buffer);
        // Will throw error if the actor has no access rights
        profile.addEHR(actorId, Number.parseInt(ehrId));
        buffer = Buffer.from(JSON.stringify(profile));
        await ctx.stub.putState(ssn, buffer);
    }

    async viewEHR(ctx, ehrId, actorId) {
        console.info('============= START : viewEHR ===========');
        const buffer = await ctx.stub.getState(ehrId);
        const ehr = Utils.handleStateQueryResult(buffer);
        console.info('============= END : viewEHR ===========');
        if (ehr.hasAccess(actorId)) {
            return ehr;
        } else {
            return {};
        }
    }

    async getAllEHRforActor(ctx, actorId) {
        console.info('============= START : getAllEHRforActor ===========');
        console.info(actorId);
        let queryString = {};
        queryString.selector = {
            docType: 'ehr',
            accessList: {
                $elemMatch: {
                    $eq: Number.parseInt(actorId)
                }
            }
        };

        let resultsIterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));

        if (!resultsIterator) {
            console.log(`${actorId} does not exist`);
            // throw new Error(`${actorId} does not exist`);
        }
        const allResult = await Utils.handleStateQueryIterator(resultsIterator);
        console.info('============= END : getAllEHRforActor ===========');
        return allResult;
    }
}

module.exports = ElectronicHealthRecordContract;
