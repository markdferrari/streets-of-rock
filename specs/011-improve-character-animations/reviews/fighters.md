# Fighter production review

T029 remains **pending owner review**. Universal was selected under [source decisions](source-decisions.md); that selection does not approve these production actions. Review each character using quickstart B/D and the [strategy](../validation/strategy.md), including crowded gameplay at phone size, both facings, all directional travel, combo/Heavy/Dodge/Special, reactions and knockout.

| Character | Authored bindings and exact export hashes | Automated coverage | Owner full-action review |
|---|---|---|---|
| Cow | [Bindings](cow-bindings.json) | Complete semantic/physical inventory, articulated skin, loops, unchanged gameplay phases | Pending |
| Crow | [Bindings](crow-bindings.json) | Same checks, wing/feather attachment groups | Pending |
| Lion | [Bindings](lion-bindings.json) | Same checks, ROAR gesture and release binding | Pending |
| Plates | [Bindings](plates-bindings.json) | Same checks, rigid complete plate/face, launch gesture | Pending |

Ordinary motion uses neutral-corrected Universal clips. Backward travel reverses Walk; lateral gait changes the local leg-motion plane. Finishers and Heavy have adjusted motion strength. Specials and Hurt are original additions, with no donor geometry/root travel. These adaptations require visual evaluation for planted feet, clarity and silhouette; numerical checks alone do not establish those outcomes. Runtime reactions subtract imported bone rest transforms before applying their masked delta.

[Baseline captures](../validation/baseline/captures.json) retain the old motion. Browser and release records in `../validation/` identify tested artifacts. No final matched owner-reviewed action matrix or five-player preference result has been supplied.

Ordinary final-build gameplay captures (Heavy/nearby combat at 844×390): [Cow/Crow](../validation/gameplay/chromium-cow-crow.png), [Crow/Lion](../validation/gameplay/chromium-crow-lion.png), [Lion/Plates](../validation/gameplay/chromium-lion-plates.png), [Plates/Cow](../validation/gameplay/chromium-plates-cow.png). WebKit equivalents are retained in the same directory. These captures identify final Diagnostics build `7efc1a66604dc042640424dbb5685f3474f5ca8bd6650ee5cfbf92ff594e9bed` through the paired reports; they do not replace the pending matched full-action/facing owner review.
