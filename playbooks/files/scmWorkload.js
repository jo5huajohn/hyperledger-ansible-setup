"use strict";

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class SCMWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.ssccList = [];
        this.lspList = [];
    }

    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        // A small set of SSCCs taken from the contract seeds and generated examples
        this.ssccList = [
            '002136117272430584',
            '004136117213130546',
            '007175152430244256',
            '003175152454546147',
            '003175152473088345',
            '007175152436276268'
        ];

        // Known LSPs + GLN strings from the contract seeds.json
        this.lspList = [
            { name: 'LSPA', gln: '1361172848234' },
            { name: 'LSPB', gln: '5041481503043' },
            { name: 'LSPC', gln: '6546778786523' },
            { name: 'LSPD', gln: '7225514822211' },
            { name: 'LSPE', gln: '1751524265008' }
        ];

        console.log(`Worker ${this.workerIndex}: Initialized SCM workload with ${this.ssccList.length} SSCCs and ${this.lspList.length} LSPs`);
    }

    // Query a single logistic unit by SSCC (read)
    async _queryLogisticUnit() {
        const sscc = this.ssccList[Math.floor(Math.random() * this.ssccList.length)];
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'queryLogisticUnit',
            invokerIdentity: 'User1',
            contractArguments: [sscc],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }

    // Query stock at an LSP (read)
    async _queryStock() {
        const lsp = this.lspList[Math.floor(Math.random() * this.lspList.length)];
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'queryStock',
            invokerIdentity: 'User1',
            contractArguments: [lsp.name],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(request);
    }

    // Ship a logistic unit to a different LSP (update)
    async _ship() {
        const sscc = this.ssccList[Math.floor(Math.random() * this.ssccList.length)];
        let target;
        // pick a target different from a random pick (best-effort)
        do {
            target = this.lspList[Math.floor(Math.random() * this.lspList.length)];
        } while (!target);

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'ship',
            invokerIdentity: 'User1',
            contractArguments: [sscc, target.name, target.gln],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

    // Unload a pallet group / pallet (update)
    async _unload() {
        const sscc = this.ssccList[Math.floor(Math.random() * this.ssccList.length)];
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'unload',
            invokerIdentity: 'User1',
            contractArguments: [sscc],
            readOnly: false
        };

        await this.sutAdapter.sendRequests(request);
    }

    async submitTransaction() {
        // Choose operation mix:
        // 60% queryLogisticUnit, 25% queryStock, 10% ship, 5% unload
        const rand = Math.random();

        if (rand < 0.60) {
            await this._queryLogisticUnit();
        } else if (rand < 0.85) {
            await this._queryStock();
        } else if (rand < 0.95) {
            await this._ship();
        } else {
            await this._unload();
        }
    }

    async cleanupWorkloadModule() {
        console.log(`Worker ${this.workerIndex}: SCM workload cleanup (no-op)`);
    }
}

function createWorkloadModule() {
    return new SCMWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
