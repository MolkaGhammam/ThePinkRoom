# DoctorProfileCard

A pink card with doctor photo on the right and identity / headline / pricing on the left.

## When to use
- DatePage doctor header.
- A "featured doctor" block on a marketing page.

## When not to use
- An appointment summary — use `AppointmentCard`.

## Props
- `name`, `credentials` (e.g. "MBBS, FCPS (Cardiologist)").
- `headline` — short title (the doctor's specialty pitch).
- `price`, `perLabel?` — defaults to `"/per session"`.
- `startingFromLabel?` — defaults to `"Starting from"`.
- `photoSrc?: string`.
- `icon: ComponentType` — small leading badge.

## Owns
- 2-column layout (text + photo), the badge + name row, the pricing block.

## Does not own
- The CTA button — `BookingCTA` is a separate component.

## Example
```tsx
<DoctorProfileCard
  name="Dr. Olivia Bennett"
  credentials="MBBS, FCPS (Cardiologist)"
  headline="Heart Health, Screening & treatment"
  price="$35"
  photoSrc="/olivia.jpg"
  icon={HeartPulse}
/>
```
