// Only controls visible entry points; cart and order pages and APIs remain intact.
export const commerceEnabled = import.meta.env.VITE_ENABLE_COMMERCE === 'true'

// H5 storefront uses guest browsing and contact inquiries without member entry points.
let memberEntryPointsEnabled = true
// #ifdef H5
memberEntryPointsEnabled = false
// #endif
export const memberEntriesEnabled = memberEntryPointsEnabled
