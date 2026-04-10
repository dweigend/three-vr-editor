# Editor Live Layer Plan

This document defines the optional shared live layer used by controls and the node editor.

## Purpose

- keep the default `code -> preview` flow untouched
- hold temporary browser-side overrides only while interactive panels need them
- provide one shared live-edit path for controls and node editor

## Hard Rules

- code stays the source of truth
- `selectedPath` stays the shared source for code, controls, and preview
- panel visibility may activate or idle the live layer, but must never change the file source
- missing template metadata or empty discovery results are valid states

## Svelte Rules

- keep shared browser state in `.svelte.ts`
- export stable objects and mutate properties instead of reassigning exported `$state`
- use typed context only when it simplifies component-tree wiring

## Responsibilities

- discover editable values from the current file and template metadata
- hold temporary overrides
- resolve preview-facing values while active
- promote accepted values back through explicit document updates

## Non-Goals

- owning main document state
- replacing the preview builder
- creating feature-specific UI
- introducing a second preview runtime

## Next Steps

- keep discovery graceful and file-switch-safe
- preserve the current selected-file flow during future template-folder work
- stay shared between controls and node editor instead of growing feature-local live layers
