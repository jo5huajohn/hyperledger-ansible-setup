#!/bin/bash

chaincode=""
fabric_setup=false
setup=false

while getopts "sfe:" arg; do
    case $arg in
        e)
            chaincode="$OPTARG"
            ;;
        f)
            fabric_setup=true
            ;;
        s)
            setup=true
            ;;
        *)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

tags=()
if [ "$setup" = true ]; then
    tags+=('setup')
fi

if [ "$fabric_setup" = true ]; then
    tags+=('fabric_setup')
fi

if (( ${#tags[@]} == 0 )); then
    tags=('all')
fi

args="--tags $(IFS=,; echo "${tags[*]}")"
ansible-playbook playbooks/site.yaml $args