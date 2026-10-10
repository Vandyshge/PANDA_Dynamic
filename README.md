# PANDA Dynamic

Interactive PANDA-D explorer for a moving liquid roll in a slit nanopore.

**Website:** https://vandyshge.github.io/PANDA_Dynamic/

- **Theory:** nonlinear contact-angle splitting versus external force under three resistance closures. Select any combination of models and advancing/receding branches; only the no-resistance model is shown initially. The active model sets the numerical readouts and parameters transferred to the profiles page. Visible-curve selection controls plots, legends, markers, and CSV/SVG exports.
- **Profiles:** normalized density R = ρ/ρ_l and center-of-mass displacement Q = q/H, circular menisci, volume conservation, swapped-angle comparison, and CSV/SVG exports. Use manual angles or calculate both angles directly from external force and resistance.

The design and provided logo follow [PANDA Polygon](https://github.com/Vandyshge/PANDA_Polygon). All calculations run locally in the browser, with no external JavaScript dependencies or uploaded data.

## Scientific model

Equations follow the author manuscript *Dynamic contact-angle splitting of a liquid roll in a slit nanopore*, PRF revision of October 10, 2026, and the PANDA-D/COM analytical module. This site shows analytical predictions, not new MD measurements. The manuscript itself is not included.

    G(theta_rec) + G(theta_adv) = 2 G(theta0)
    2 Ly gamma (cos(theta_rec) - cos(theta_adv)) = F_eff
    G(theta) = (2 theta + sin(2 theta) - pi) / (8 cos(theta)^2)

G is evaluated using the meniscus integral U(theta, 1/2), with series expansions near 90°. G(90°) = 0 and G'(90°) = 1/6. Monotone bisection solves for angles and checks the geometric existence limit. Calculations use radians; the interface displays degrees.

Profiles use ζ = z/H, ℓ = Lx/H, and h = 1/2 − δ. Equilibrium angle and filling fraction determine wall-contact width d. The global COM is weighted by layer width. Q is undefined in empty layers, represented by blank CSV fields. The model checks positive contact width, interface intersection, and periodic-image overlap. MD fitting additionally requires finite-bin integration, treatment of vapor, and exclusion of molecular layering.

Velocity-dependent resistance is parameterized by βb under v = bF. An angle fit with omitted resistance estimates an effective γ_th rather than independently measuring γ_lv.

## Run and verify

Node.js is required; no package installation is needed.

    npm start
    npm test

Local preview: http://127.0.0.1:4175/

GitHub Pages serves `docs/` from `main`; no build step is needed.

## Files

    docs/index.html       splitting theory
    docs/profiles.html    density and center-of-mass profiles
    docs/model.js         scientific model
    docs/chart.js         SVG charts and exports
    tests/model.test.js   numerical and physical invariants

## Reference

Semenchuk A.A., Kondratyuk N.D., Kopanichuk I.V. (2025). PANDA: Predicting angle from nanoscale density analysis. Colloids and Surfaces A 708, 135994. https://doi.org/10.1016/j.colsurfa.2024.135994
