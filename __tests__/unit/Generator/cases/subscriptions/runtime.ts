import type { SubscriptionsSubscription } from './result'

export default function (query: SubscriptionsSubscription): void {
  if (!query.formSubmitted) {
    return
  }

  console.log(query.formSubmitted.timestamp)
  console.log(query.formSubmitted.id)
}
