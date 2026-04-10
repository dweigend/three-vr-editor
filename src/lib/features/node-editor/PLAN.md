# Node Editor Plan

This document tracks the next concrete steps for the optional node editor.

## Product Rules

- optional workbench module, not a separate route
- code stays the source of truth
- shared live layer is the only live-edit path
- empty discovery results are valid

## Next Steps

- keep the current base infrastructure but simplify where needed
- normalize every modulation signal to `0..1`
- let targets map normalized input into real value ranges
- remove redundant target-local controls that conflict with the modular signal model
- add readable `Apply to Code` snippet generation for a small first set of supported modules
- improve node and edge deletion affordances
- refactor render, signal logic, and code generation into clearer boundaries
- remove obsolete files after the refactor

## Key Constraints

- no second preview source
- no Pi, auth, or provider dependencies
- no hidden file-source switching when panels are shown or hidden
