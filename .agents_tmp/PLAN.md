# 1. OBJECTIVE

Create a beautiful, interactive BOS360 model page that replaces version 1 with a modern, slick design featuring:
- Three pillar circles (Business, Brand, Team) with hover and click states
- Click-to-open bottom sheet modals with detailed information
- Three bonding force intersections (Strategy, Execution, Culture)
- Resting state showing just the words in circle segments
- Fully responsive (works slick on both web and mobile)
- Page length: 1.5-2 full browser scrolls max (ideally above the fold)
- Keep version 2 at the bottom of the page (unchanged)

# 2. CONTEXT SUMMARY

**The BOS360 Model Structure:**
- **3 Pillars (Circles):**
  1. **Business** - Ability to generate cash, create value, grow and be profitable
  2. **Brand** - Company identity, reputation, customer expectations
  3. **Team** - Competent, dependable, happy, high-performing people

- **3 Bonding Forces (Intersections):**
  1. **Strategy** (Brand + Business) - Unique Vision, where you're going and how to get there. Guiding force.
  2. **Execution** (Business + Team) - Focus, discipline, accountability. Driving force.
  3. **Culture** (Brand + Team) - Unique vibe, attracts right people. Energizing force.

**Key Messaging to Incorporate:**
- "Clarify your Strategy, Simplify your Execution, Energise your Culture"
- "To simultaneously build a Profitable Business, Valued Brand and High Performing Team"
- Goal: Get from ~20% strong to 100% strong in all 6 components

**Technical Requirements:**
- Click triggers bottom sheet modals (NOT hover for modals)
- Bottom sheets contain: pillar/force name, description, key tools/disciplines
- Resting state: Only words visible in circles
- Responsive: Works on mobile (touch) and desktop (click)

# 3. APPROACH OVERVIEW

**Design Approach:**
- Use CSS-only three-circle Venn diagram layout (no heavy libraries)
- Each pillar circle is clickable, triggers a bottom sheet modal
- Bonding forces displayed as intersection labels (also clickable for modals)
- Central "BOS360" core as anchor/brand element
- Mobile-first responsive design with touch-friendly bottom sheets
- Subtle animations for hover states on desktop
- Smooth bottom sheet slide-up animations

**Why This Approach:**
- Lightweight, fast loading (no heavy JS libraries needed)
- Bottom sheets work great on both mobile (native feel) and desktop
- CSS-only visuals for performance
- Easy to maintain and update content
- Keeps page length short (~1.5-2 scrolls max)

# 4. IMPLEMENTATION STEPS

### Step 1: Define Data Structure for Pillars and Forces
- Create TypeScript interfaces for each pillar and bonding force
- Populate with content from talk track (description + tools)
- Reference: `app/bos360-model/page.tsx`

### Step 2: Create Interactive Circle Layout (CSS-only)
- Three overlapping circles in Venn diagram formation
- Pillar labels centered in each circle
- Bonding force labels at intersections
- Central BOS360 logo/core element
- Reference: `app/bos360-model/page.tsx`

### Step 3: Implement Click-to-Open Bottom Sheet System
- Create React state for tracking which element is clicked
- Build bottom sheet component with:
  - Slide-up animation
  - Close button (X)
  - Content area with pillar/force info
  - Backdrop overlay
- Implement click handlers on circles and intersection labels
- Reference: `app/bos360-model/page.tsx`

### Step 4: Add Hover States (Desktop Only)
- Subtle scale/glow effect on circle hover
- Cursor changes to indicate clickability
- Only applies on non-touch devices (media query)
- Reference: `app/bos360-model/page.tsx`

### Step 5: Responsive Design for Mobile
- Ensure circles stack or scale properly on small screens
- Bottom sheets become full-width on mobile
- Touch-friendly tap targets (min 44px)
- Test on both iOS and Android viewport sizes
- Reference: `app/bos360-model/page.tsx`

### Step 6: Keep Version 2 at Bottom (Unchanged)
- Ensure existing version 2 code remains at bottom of page
- Add a visual divider between new interactive version and version 2
- Reference: `app/bos360-model/page.tsx`

# 5. TESTING AND VALIDATION

**Visual Checkpoints:**
- [ ] At resting state, only words visible in circle segments (Business, Brand, Team, Strategy, Execution, Culture)
- [ ] Hover on desktop shows subtle scale/glow effect on circles
- [ ] Click on any circle or intersection label opens bottom sheet
- [ ] Bottom sheet contains: title, description, key tools from talk track
- [ ] Bottom sheet has working close button (X)
- [ ] Clicking backdrop also closes bottom sheet
- [ ] Page fits within 1.5-2 browser scroll heights (ideally above fold)
- [ ] Mobile view: circles visible and tappable
- [ ] Mobile view: bottom sheets work smoothly
- [ ] Version 2 remains at bottom of page unchanged

**Functional Tests:**
- [ ] All 6 elements (3 pillars + 3 forces) open unique bottom sheets
- [ ] Bottom sheet content matches talk track messaging
- [ ] Responsive at 375px width (mobile), 768px (tablet), 1440px (desktop)
- [ ] No horizontal scroll on any viewport
- [ ] Animations are smooth (60fps)
