'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'CreateAsset',
                invokerIdentity: 'User1',
                contractArguments: [assetID,'blue','20','penguin','500'],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }

    async submitTransaction() {
        const randomId = Math.floor(Math.random() * this.roundArguments.assets);
        const assetID = `${this.workerIndex}_${randomId}`;

        // Randomly decide to read or update
        const doUpdate = Math.random() < 0.5; // 50% chance update, 50% read

        if (doUpdate) {
            const newColor = ['red','green','yellow','black'][Math.floor(Math.random()*4)];
            const newSize = (Math.floor(Math.random() * 100) + 1).toString();
            const newOwner = `owner_${Math.floor(Math.random() * 10)}`;
            const newValue = (Math.floor(Math.random() * 1000) + 100).toString();

            console.log(`Worker ${this.workerIndex}: Updating asset ${assetID}`);
            const updateArgs = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'UpdateAsset',
                invokerIdentity: 'User1',
                contractArguments: [assetID, newColor, newSize, newOwner, newValue],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(updateArgs);
        } else {
            const readArgs = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'ReadAsset',
                invokerIdentity: 'User1',
                contractArguments: [assetID],
                readOnly: true
            };

            await this.sutAdapter.sendRequests(readArgs);
        }
    }

    async cleanupWorkloadModule() {
        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting asset ${assetID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'DeleteAsset',
                invokerIdentity: 'User1',
                contractArguments: [assetID],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
