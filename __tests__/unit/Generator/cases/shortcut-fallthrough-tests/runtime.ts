import type {
  TwoFragmentsSameTypeQuery,
  TwoAbstractFragmentsQuery,
  MixedFragmentCountsQuery,
  SingleTypeInterfaceQuery,
  InlineSpreadOnConcreteFieldQuery,
  InlineAndFragmentOnConcreteFieldQuery,
  InlineSpreadConcreteOnInterfaceQuery,
  FragmentAndInlineOnSameConcreteTypeQuery,
  InterfaceFragmentAndInlineSpreadQuery,
  MixedInterfaceAndConcreteInlineQuery,
  MultipleConcreteInlineSpreadsQuery,
  AllCombinedQuery,
  InlineOnSingleImplementerQuery,
} from './result'

export default function (
  q1: TwoFragmentsSameTypeQuery,
  q2: TwoAbstractFragmentsQuery,
  q3: MixedFragmentCountsQuery,
  q4: SingleTypeInterfaceQuery,
  q5: InlineSpreadOnConcreteFieldQuery,
  q6: InlineAndFragmentOnConcreteFieldQuery,
  q7: InlineSpreadConcreteOnInterfaceQuery,
  q8: FragmentAndInlineOnSameConcreteTypeQuery,
  q9: InterfaceFragmentAndInlineSpreadQuery,
  q10: MixedInterfaceAndConcreteInlineQuery,
  q11: MultipleConcreteInlineSpreadsQuery,
  q12: AllCombinedQuery,
  q13: InlineOnSingleImplementerQuery,
): void {
  // ===== Test 1: Two fragments on same type =====
  const entity1 = q1.getRandomEntity
  if (entity1) {
    if ('id' in entity1) {
      console.log(entity1.id)
      console.log(entity1.title)
      console.log(entity1.body)
    }
    // @ts-expect-error - Cannot access without narrowing
    console.log(entity1.id)
  }

  // ===== Test 2: Two abstract fragments =====
  const entity2 = q2.getRandomEntity
  if (entity2) {
    // No narrowing needed - all types covered
    console.log(entity2.id)
    console.log(entity2.entityType)
  }

  // ===== Test 3: Mixed fragment counts =====
  const entity3 = q3.getRandomEntity
  if (entity3) {
    if ('tags' in entity3) {
      console.log(entity3.body)
      console.log(entity3.tags)
    }
    // @ts-expect-error - Cannot access without narrowing
    console.log(entity3.id)
  }

  // ===== Test 4: Single type interface =====
  const entity4 = q4.getSingleImplementer
  if (entity4) {
    console.log(entity4.value)
  }

  // ===== Test 5: Inline spread on concrete field =====
  const page5 = q5.getNodePage
  if (page5) {
    // No narrowing needed - field returns concrete type
    console.log(page5.title)
    console.log(page5.body)
  }

  // ===== Test 6: Inline + fragment on concrete field =====
  const page6 = q6.getNodePage
  if (page6) {
    // No narrowing needed - field returns concrete type
    console.log(page6.id)
    console.log(page6.title)
    console.log(page6.body)
  }

  // ===== Test 7: Inline spread on concrete within interface =====
  const entity7 = q7.getRandomEntity
  if (entity7) {
    // Need narrowing - could be empty object
    if ('title' in entity7) {
      console.log(entity7.title)
      console.log(entity7.body)
    }
    // @ts-expect-error - Cannot access without narrowing
    console.log(entity7.title)
  }

  // ===== Test 8: Fragment + inline on same concrete within interface =====
  const entity8 = q8.getRandomEntity
  if (entity8) {
    if ('id' in entity8) {
      console.log(entity8.id)
      console.log(entity8.title)
      console.log(entity8.body)
    }
    // @ts-expect-error - Cannot access without narrowing
    console.log(entity8.id)
  }

  // ===== Test 9: Interface fragment + inline interface spread =====
  const entity9 = q9.getRandomEntity
  if (entity9) {
    // No narrowing needed - interface selections cover all types
    console.log(entity9.id)
    console.log(entity9.entityType)
  }

  // ===== Test 10: Interface + concrete inline spreads =====
  const entity10 = q10.getRandomEntity
  if (entity10) {
    // All types have base fields from interface
    console.log(entity10.id)
    console.log(entity10.entityType)

    // Narrow for type-specific fields
    if ('tags' in entity10) {
      console.log(entity10.tags)
    }
    if ('title' in entity10) {
      console.log(entity10.title)
    }
  }

  // ===== Test 11: Multiple concrete inline spreads =====
  const entity11 = q11.getRandomEntity
  if (entity11) {
    if ('tags' in entity11) {
      console.log(entity11.body)
      console.log(entity11.tags)
    } else if ('title' in entity11) {
      console.log(entity11.body)
      console.log(entity11.title)
    }
    // @ts-expect-error - Cannot access without narrowing (could be object)
    console.log(entity11.body)
  }

  // ===== Test 12: All combined =====
  const entity12 = q12.getRandomEntity
  if (entity12) {
    // id is on all branches
    console.log(entity12.id)

    if ('tags' in entity12) {
      console.log(entity12.tags)
    }
    if ('body' in entity12) {
      console.log(entity12.body)
    }
  }

  // ===== Test 13: Inline on single implementer =====
  const entity13 = q13.getSingleImplementer
  if (entity13) {
    // No narrowing needed - only one implementing type
    console.log(entity13.value)
  }
}
