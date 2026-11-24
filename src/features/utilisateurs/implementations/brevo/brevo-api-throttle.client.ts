import pThrottle from 'p-throttle'

export const brevoApiThrottle = pThrottle({
  limit: 10,
  interval: 1100,
})
