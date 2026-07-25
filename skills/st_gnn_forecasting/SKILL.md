---
name: st-gnn-forecasting
description: Spatio-temporal graph neural network (ST-GNN) & XGBoost risk prediction for police beat corridors.
---

# Spatio-Temporal Risk Forecasting Skill

This skill implements spatio-temporal risk modeling over police beat polygons.

## Features

- **Spatial Modeling**: PostGIS spatial indexing & distance decay over police beat grids.
- **Temporal Dynamics**: Day-of-week, hour-of-day, and night patrol multipliers (+25% night, +15% weekend).
- **Intervention Counterfactuals**: Calculating risk reduction when Hoysala patrol units or ANPR checkpoints are added.
