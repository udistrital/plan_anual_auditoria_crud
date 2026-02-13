#!/bin/bash

# Typecheck
npm run typecheck

# Lint + Formato (calidad base y smells típicos)
npm run lint
npm run format

# Test + cov
npm test
npm run test:cov

# build
npm run build

# Dependencias vulnerables
npm audit