'use strict';

class Ehr {
    constructor(hashKey, resource, accessList) {
        this.docType = 'ehr';
        this.hashKey = hashKey;
        this.resource = resource;
        this.accessList = (accessList === undefined) ? [] : accessList;
    }

    addToAccessList(actorId) {
        const actorIdNum = Number.parseInt(actorId);
        if (!this.accessList.includes(actorIdNum)) {
            this.accessList.push(actorIdNum);
        }
    }

    removeFromAccessList(actorId) {
        const actorIdNum = Number.parseInt(actorId);
        const index = this.accessList.indexOf(actorIdNum);
        if (index > -1) {
            this.accessList.splice(index, 1);
        }
    }

    hasAccess(actorId) {
        const actorIdNum = Number.parseInt(actorId);
        return this.accessList.includes(actorIdNum);
    }

    static fromJSON(obj) {
        // Accept both 'ressource' (typo in legacy data) and 'resource' (correct spelling)
        const resourceValue = obj.resource || obj.ressource;
        if (obj.hashKey !== undefined && resourceValue !== undefined) {
            return new Ehr(obj.hashKey, resourceValue, obj.accessList);
        }
        throw new Error(`Could not construct Ehr from ${obj}`);
    }
}

module.exports = Ehr;