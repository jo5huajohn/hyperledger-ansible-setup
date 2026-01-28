'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for Electronic Health Record chaincode benchmarking
 * Focuses on read-heavy operations typical in healthcare scenarios
 */
class EHRWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.ssnList = [];
        this.ehrIdList = [];
        this.actorIds = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        console.log(`Worker ${this.workerIndex}: Initializing EHR workload module`);

        // Pre-defined SSNs from seeds.json (sample set)
        this.ssnList = [
            '113012026', '118615376', '123804267', '131518607', '137062660',
            '138346453', '143116311', '160115031', '172721505', '214138014',
            '231208051', '238063605', '243474483', '254121751', '260537546',
            '261086832', '263322674', '263772701', '264718756', '280865267'
        ];

        // Pre-defined EHR IDs from seeds.json (sample set)
        this.ehrIdList = [
            '10341222', '10431560', '10735534', '10868820', '11344525',
            '12185155', '12515655', '13534881', '14823250', '15338046',
            '15515078', '16486107', '16631233', '17704747', '18432132',
            '21138160', '21483124', '21718337', '21873524', '22726411'
        ];

        // Actor IDs (healthcare providers, patients, etc.)
        this.actorIds = [0, 1, 2, 3, 4, 5, 6, 7];

        console.log(`Worker ${this.workerIndex}: Loaded ${this.ssnList.length} SSNs, ${this.ehrIdList.length} EHR IDs, ${this.actorIds.length} actors`);
    }

    async _viewPartialProfile() {
        const randomSsn = this.ssnList[Math.floor(Math.random() * this.ssnList.length)];
        const randomActor = this.actorIds[Math.floor(Math.random() * this.actorIds.length)];

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'viewPartialProfile',
            invokerIdentity: 'User1',
            contractArguments: [randomSsn, randomActor.toString()],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }

    async _viewEHR() {
        const randomEhrId = this.ehrIdList[Math.floor(Math.random() * this.ehrIdList.length)];
        const randomActor = this.actorIds[Math.floor(Math.random() * this.actorIds.length)];

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'viewEHR',
            invokerIdentity: 'User1',
            contractArguments: [randomEhrId, randomActor.toString()],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }

    async _getAllEHRforActor() {
        const randomActor = this.actorIds[Math.floor(Math.random() * this.actorIds.length)];

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'getAllEHRforActor',
            invokerIdentity: 'User1',
            contractArguments: [randomActor.toString()],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }

    async submitTransaction() {
        // 70% viewPartialProfile - healthcare providers checking patient summaries
        // 20% viewEHR - viewing specific health records
        // 10% getAllEHRforActor - actors retrieving all accessible records

        const rand = Math.random();

        if (rand < 0.70) {
            // viewPartialProfile - most common operation
            await this._viewPartialProfile();
        } else if (rand < 0.90) {
            // viewEHR - viewing specific health record
            await this._viewEHR();
        } else {
            // getAllEHRforActor - retrieving all records for an actor
            await this._getAllEHRforActor();
        }
    }

    async cleanupWorkloadModule() {
        console.log(`Worker ${this.workerIndex}: Cleaning up EHR workload module`);
    }
}

function createWorkloadModule() {
    return new EHRWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;