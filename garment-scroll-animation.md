# Garment Scroll Animation Guide

This document explains the garment scroll animation used in the homepage section and how it works. The focus is on the garment-specific scroll experience, not the full page.

## What this animation is

The garment scroll is a scroll-driven storytelling effect where a single garment visual moves through a sequence of states as the user scrolls.

Instead of a basic fade or slide, this section creates the feeling that the garment is physically traveling through the screen while the story changes around it. The motion is tied to the user's scroll progress, so each stage of the animation happens at a specific point in the page.

In simple terms, the animation is:

- a sticky section that stays in view while the page scrolls,
- a garment graphic that changes position, scale, rotation, and opacity,
- a set of text blocks that appear at different scroll points,
- a background glow and particle motion that reinforces the atmosphere.

## Where it lives

The main logic is in:

- [src/pages/HomePage/sections/GarmentSequence/GarmentSequence.jsx](src/pages/HomePage/sections/GarmentSequence/GarmentSequence.jsx)
- [src/pages/HomePage/sections/GarmentSequence/GarmentArt.jsx](src/pages/HomePage/sections/GarmentSequence/GarmentArt.jsx)

## The core idea

The section uses one main scroll progress value and maps that value to several animated properties.

That means:

- when the user is near the top of the section, the garment is still entering,
- when the user reaches the middle, the garment becomes more prominent and the detail view appears,
- when the user reaches the end, the garment exits the frame.

The animation feels smooth because each property is driven by a continuous progress value rather than discrete jumps.

## Main building blocks

### 1. Scroll progress tracking

The animation starts by measuring how far the user has scrolled through the section.

In the component, the code uses Framer Motion's scroll hook:

- `useScroll`
- `useTransform`
- `useSpring`
- `useReducedMotion`

The section is set up with a scroll container and then listens to the scroll position relative to that container.

This gives a value between 0 and 1:

- `0` = the user is at the start of the section
- `1` = the user has reached the end of the section

That value becomes the engine for the rest of the animation.

### 2. Progress mapping to movement

Once progress is known, the component maps that number to multiple visual properties.

For example:

- `x` moves the garment from left to right across the screen
- `y` moves it up and down
- `rotate` changes the tilt of the garment
- `scale` makes it grow and shrink
- `opacity` fades it in and out

Each of these is controlled by a set of breakpoints. A simple example is:

- at the start, the garment is small and faint
- in the middle, it becomes large and clear
- near the end, it shrinks again and fades out

That is what creates the “traveling garment” illusion.

### 3. Spring smoothing

The animation does not use raw motion values directly. It uses `useSpring` to soften the motion.

This makes the transitions feel more natural and less robotic.

Why this matters:

- the motion feels less jerky,
- the garment moves with a more organic rhythm,
- the transitions between states feel polished.

### 4. Layered garment views

The component renders three versions of the garment at once:

- `front`
- `detail`
- `back`

Each one is wrapped in its own motion layer.

The layers are controlled with different opacity values:

- the front view appears first,
- the detail view becomes stronger at the middle stage,
- the back view becomes visible near the end.

This creates the sense that the garment is changing perspective as the user scrolls.

### 5. Text blocks tied to the same scroll progress

The copy is not static. It appears in three moments:

1. the first story block appears early,
2. the second appears in the middle,
3. the third appears near the end.

Each text block has its own opacity, vertical movement, and scale tied to the same progress system. That makes the copy feel like part of the same animation timeline rather than separate content.

### 6. Background atmosphere

The scene is supported by:

- a soft radial glow,
- floating particles,
- subtle background movement.

These effects are not the main story, but they make the garment feel embedded in a richer environment.

## How the animation unfolds

Here is the general flow of the experience:

### Phase 1: Entry

At the beginning of the scroll:

- the garment is faint,
- it appears small,
- it starts slightly off-center,
- the first text block begins to show.

This gives the viewer an introduction to the garment.

### Phase 2: Focus

As the scroll continues:

- the garment grows,
- it moves into a stronger position,
- the detail layer becomes more visible,
- the middle story block comes into focus.

This stage is the emotional center of the animation.

### Phase 3: Exit

Near the end of the section:

- the garment shifts again,
- the back view becomes more visible,
- the last text block appears,
- everything fades out.

This creates a clean ending where the garment feels like it has completed its journey.

## Why it feels smooth

The animation feels polished for a few reasons:

- it uses a continuous scroll value instead of hard-coded triggers,
- it maps that value to multiple transforms at once,
- it uses spring animation for softer easing,
- it keeps everything inside a sticky viewport so the motion is centered and consistent,
- it has a reduced-motion fallback for accessibility.

That combination is what makes it feel more like a cinematic sequence than a basic scroll effect.

## What the garment art component does

The SVG component in [src/pages/HomePage/sections/GarmentSequence/GarmentArt.jsx](src/pages/HomePage/sections/GarmentSequence/GarmentArt.jsx) is responsible for rendering the garment visuals.

It creates a stylized garment silhouette with:

- a body shape,
- side panels,
- accent details,
- a label and price text,
- optional image-based rendering.

The component supports different views:

- `front`
- `detail`
- `back`

That is why the section can switch visual states without changing the whole setup.

## Mental model

A useful way to think about the animation is:

- scroll progress is the control signal,
- the garment is the main object being transformed,
- the text and atmosphere are secondary layers that respond to the same signal.

So the whole section is really one coordinated timeline.

## How to think about replicating it

If you want to rebuild this effect in another project, the general recipe is:

1. create a section with a tall height so the user has to scroll through it,
2. make the section sticky so the content stays in view,
3. track scroll progress inside that section,
4. use progress to animate position, scale, opacity, and rotation,
5. add layered visuals and text that respond to the same progress value,
6. smooth the motion with spring easing.

## Summary

The garment scroll animation is a scroll-based narrative sequence. It turns a static garment graphic into a cinematic motion piece by linking scroll progress to movement, opacity, perspective, and storytelling.

The main idea is simple:

- as the user scrolls, the garment moves through a visual journey,
- the text supports that journey,
- the whole scene feels smooth because the motion is continuous and softened.

That is why it feels more polished than a standard scroll animation.
