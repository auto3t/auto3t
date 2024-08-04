#!/bin/bash

function validate {

    if [[ $1 ]]; then
        check_path="$1"
    else
        check_path="."
    fi

    echo "run validate on $check_path"

    echo "running black"
    black --force-exclude "migrations/*" --diff --color --check -l 120 "$check_path"
    echo "running codespell"
    codespell --skip="./.git,./.venv,./package.json,./package-lock.json,./frontend/node_modules,./.mypy_cache,./volume" "$check_path"
    echo "running flake8"
    flake8 "$check_path" --exclude "migrations,.venv" --count --max-complexity=10 \
        --max-line-length=120 --show-source --statistics
    echo "running isort"
    isort --skip "migrations" --skip ".venv" --skip "frontend" --check-only --diff --profile black -l 120 "$check_path"
    printf "    \n> all validations passed\n"

}

if [[ $1 == "validate" ]]; then
    validate "$2"
else
    echo "valid options are: validate"
fi


##
exit 0
