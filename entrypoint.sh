#!/usr/bin/env bash

set -e
set -u
set -o pipefail

export PLAN_ANUAL_AUDITORIA_USER="$(aws ssm get-parameter --name /${PARAMETER_STORE}/plan_anual_auditoria_crud/db/username --output text --query Parameter.Value)"
export PLAN_ANUAL_AUDITORIA_PASS="$(aws ssm get-parameter --with-decryption --name /${PARAMETER_STORE}/plan_anual_auditoria_crud/db/password --output text --query Parameter.Value)"

exec node dist/main