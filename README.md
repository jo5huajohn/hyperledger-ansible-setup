# Ansible Setup for K8s Fabric Network

This repository contains everything required to replicate experiments done so far. It sets up k3s on four nodes, installs Hyperledger Fabric, Hyperledger Caliper, brings up the network using the test-network-k8s sample, and benchmarks different chaincodes on it.

## Prerequirements

* Ansible

> [!NOTE]
> It is recommended to use VSCode with the Dev Containers extension, as the devcontainer file will install all requirements required for this project.

## Execution

The entire project can be set up and run using `run.sh`.

### Setup only K3s cluster

```bash
./run.sh -s
```

### Setup only Hyperledger Fabric

```bash
./run.sh -f
```

## Variables Required to be Defined

All variables required to be defined can be found in `inventory/hosts.yml`
* All k3s node domains
* `ansible_user`: Remote username on target machine.
* `token`: k3s token.

### Caliper Variables
* `caliper_benchmark_workers_number`:
* `caliper_benchmark_rounds_txDuration`: 
* `caliper_benchmark_rounds_rateControl_opts_transactionLoad`:
* `caliper_benchmark_rounds_workload_arguments_assets`: 

### Main Resource Variables
* `endorser_peer_main_resources_requests_cpu`:
* `endorser_peer_main_resources_requests_memory`:
* `endorser_peer_main_resources_limits_cpu`: "
* `endorser_peer_main_resources_limits_memory`:
* `non_endorser_peer_main_resources_requests_cpu`:
* `non_endorser_peer_main_resources_requests_memory`:
* `non_endorser_peer_main_resources_limits_cpu`:
* `non_endorser_peer_main_resources_limits_memory`:

### CouchDB Resource Variables
* `endorser_peer_couchdb_resources_requests_cpu`:
* `endorser_peer_couchdb_resources_requests_memory`:
* `endorser_peer_couchdb_resources_limits_cpu`:
* `endorser_peer_couchdb_resources_limits_memory`:
* `non_endorser_peer_couchdb_resources_requests_cpu`:
* `non_endorser_peer_couchdb_resources_requests_memory`:
* `non_endorser_peer_couchdb_resources_limits_cpu`:
* `non_endorser_peer_couchdb_resources_limits_memory`: