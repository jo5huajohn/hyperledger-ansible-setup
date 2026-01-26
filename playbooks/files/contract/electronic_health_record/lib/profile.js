'use strict';

class Profile {
    constructor(hashKey, patientName, age, allEhr, accessList) {
        this.docType = 'profile';
        this.hashKey = hashKey;
        this.patientName = patientName;
        this.age = age;
        this.allEhr = (allEhr === undefined) ? [] : allEhr;
        this.accessList = (accessList === undefined) ? [] : accessList;
    }

    static fromJSON(obj) {
        if (obj.hashKey !== undefined && obj.patientName !== undefined && obj.age !== undefined) {
            return new Profile(obj.hashKey, obj.patientName, obj.age, obj.allEhr, obj.accessList);
        }
        throw new Error(`Could not construct Profile from ${obj}`);
    }

    grantProfileAccess(hashKey, actorId) {
        if (hashKey === this.hashKey) {
            if (!this.accessList.includes(Number.parseInt(actorId))) {
                this.accessList.push(Number.parseInt(actorId));
            }
        }
    }

    revokeProfileAccess(hashKey, actorId) {
        if (hashKey === this.hashKey) {
            const index = this.accessList.indexOf(Number.parseInt(actorId));
            if (index > -1) {
                this.accessList.splice(index, 1);
            }
        }
    }

    grantEHRAccess(hashKey, actorId, ehrId) {
        if (hashKey === this.hashKey) {
            let allEhr = this.allEhr.filter(ehr => ehr.id === ehrId);
            // will be just one entry
            allEhr.forEach(ehr => {
                if (!ehr.accessList.includes(Number.parseInt(actorId))) {
                    ehr.accessList.push(Number.parseInt(actorId));
                }
            });
        }
    }

    revokeEHRAccess(hashKey, actorId, ehrId) {
        if (hashKey === this.hashKey) {
            let allEhr = this.allEhr.filter(ehr => ehr.id === ehrId);
            // will be just one entry
            allEhr.forEach(ehr => {
                const index = ehr.accessList.indexOf(Number.parseInt(actorId));
                if (index > -1) {
                    ehr.accessList.splice(index, 1);
                }
            });
        }
    }

    viewPartialProfile(actorId) {
        let allEhr = this.allEhr.filter(ehr => ehr.accessList.includes(Number.parseInt(actorId)));
        return {
            patientName: this.patientName,
            allEhr: allEhr
        };
    }

    addEHR(actorId, ehrId) {
        if (this.accessList.includes(Number.parseInt(actorId))) {
            if (this.allEhr.every(ehr => ehr.id !== ehrId)) {
                this.allEhr.push(
                    {
                        id: ehrId,
                        accessList: [Number.parseInt(actorId)]
                    }
                );
            } else {
                throw Error('Could not add EHR, EHR already exists in profile.');
            }
        } else {
            throw Error('Could not add EHR, actor has no access to Patient Profile.');
        }
    }
}

module.exports = Profile;
