# Control Panel Plan

This document tracks the next concrete steps for the optional control panel.

## Product Rules

- optional workbench module, not a separate route
- shared live layer is the only live-edit path
- `selectedPath` stays the shared file source
- empty discovery results are valid

## Next Steps

- keep the panel compact and parameter-first
- preserve the current file-switch flow while template folders are introduced
- move future control metadata into template-local helper files once the folder model lands
- keep accepted changes explicit and routed back through document updates
- avoid duplicate grouping, stale empty states, or feature-local live state

## Key Constraints

- no second preview source
- no Pi, auth, or provider dependencies
- hidden panels must leave no runtime side effects
