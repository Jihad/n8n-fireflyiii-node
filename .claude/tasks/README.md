# Feature Tasks Documentation

This folder contains design specifications and implementation summaries for features added to the n8n Firefly III node.

## Purpose

- **Design Documents**: Comprehensive specifications created during the planning phase
- **Implementation Summaries**: Post-implementation documentation with testing checklists
- **Historical Reference**: Track feature evolution and implementation decisions

## Current Features

### Bills Endpoint
- **Design**: `DESIGN_BILLS_ENDPOINT.md` - Complete specification for Bills resource implementation
- **Summary**: `BILLS_IMPLEMENTATION_SUMMARY.md` - Implementation summary with 8 operations

## Guidelines for Future Features

When implementing new Firefly III endpoints:

1. **Design Phase**: Create `DESIGN_[FEATURE]_ENDPOINT.md` with:
   - API endpoint analysis
   - Operation specifications
   - Field definitions
   - Implementation strategy

2. **Implementation Phase**: Follow design specification exactly

3. **Summary Phase**: Create `[FEATURE]_IMPLEMENTATION_SUMMARY.md` with:
   - Operation count and descriptions
   - Special handling notes
   - Testing checklist
   - Known limitations

## File Naming Convention

- Design specs: `DESIGN_[FEATURE]_ENDPOINT.md`
- Implementation summaries: `[FEATURE]_IMPLEMENTATION_SUMMARY.md`
- Use UPPER_SNAKE_CASE for feature names
- Keep all feature task documentation in this folder
