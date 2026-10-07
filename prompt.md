# Project Prompts Log

This document records the user prompts used to build and evolve the **Metropolitan Transit Velocity** application.

---

## Prompt 1: Initial Application Specification & Design System

```text
Build me an app with screens that look like this. You can hotlink images from the HTML
```

### Attached Design Specification (Metropolitan Transit Velocity):
```yaml
name: Metropolitan Transit Velocity
colors:
  surface: '#f8f9ff'
  surface-dim: '#d5dae6'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e9eefa'
  surface-container-high: '#e3e8f4'
  surface-container-highest: '#dde3ee'
  on-surface: '#161c24'
  on-surface-variant: '#50434d'
  inverse-surface: '#2b3139'
  inverse-on-surface: '#ebf1fd'
  outline: '#82727e'
  outline-variant: '#d4c1ce'
  surface-tint: '#913d8b'
  primary: '#520051'
  on-primary: '#ffffff'
  primary-container: '#6e1d6b'
  on-primary-container: '#eb8ce0'
  inverse-primary: '#ffabf3'
  secondary: '#a43e00'
  on-secondary: '#ffffff'
  secondary-container: '#ff7a39'
  on-secondary-container: '#632200'
  tertiary: '#002f44'
  on-tertiary: '#ffffff'
  tertiary-container: '#004664'
  on-tertiary-container: '#71b5e0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffd7f5'
  primary-fixed-dim: '#ffabf3'
  on-primary-fixed: '#380038'
  on-primary-fixed-variant: '#752471'
  secondary-fixed: '#ffdbcd'
  secondary-fixed-dim: '#ffb596'
  on-secondary-fixed: '#360f00'
  on-secondary-fixed-variant: '#7d2d00'
  tertiary-fixed: '#c7e7ff'
  tertiary-fixed-dim: '#8bcefb'
  on-tertiary-fixed: '#001e2e'
  on-tertiary-fixed-variant: '#004c6c'
  background: '#f8f9ff'
  on-background: '#161c24'
  surface-variant: '#dde3ee'
  surface-canvas: '#F6F8FA'
  surface-card: '#FFFFFF'
  load-seats-available: '#00875A'
  load-standing-available: '#E28800'
  load-limited-standing: '#DE350B'
  wab-accessibility: '#0065FF'
  border-subtle: '#E2E8F0'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 34px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  bus-number:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '800'
    lineHeight: 24px
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-bold:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
  label-timing:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
```

---

## Prompt 2: GitHub Repository Push

```text
git push https://<GITHUB_TOKEN>@github.com/mengkwang/mcp-bus.git
```

---

## Prompt 3: Backend API Endpoints & LTA DataMall Integration

```text
1) create a /api folder under the project main to store all the apis 
2) create a /api/health.js to monitor if the apis are working 
3) integrate the LTA bus information api endpoint GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
Header:  AccountKey: 

# BusStopCode is the only required parameter.
# Add &ServiceNo=7 to ask about one service only.
# Refreshes every 20 seconds. JSON comes back by default.
i will add the LTA_ACCOUNT_KEY in vercel environment variables later
```

---

## Prompt 4: Prompt Archival Documentation

```text
create a prompt.md containing all my prompts located at project main
```

---

## Prompt 5: Migrate API Endpoints to TypeScript and Fix Key Serving in Updates

```text
1. revise API folder as bus-arrival and health .ts files from .js files

2. API key is not served in updates 

3. API key was initially served with serverless Vercel API key deployment; check if API is healthy; if not, fix the issue.
```

