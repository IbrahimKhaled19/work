/**
 * Open roles.
 *
 * EMPTY ON PURPOSE. No opening has been confirmed by the business, and a
 * plausible-looking vacancy is a claim about a real company that nobody has
 * verified - the same reason PRODUCT.md forbids inventing testimonials, case
 * studies, press or pricing. An invented job listing is worse than a missing
 * one: it costs a candidate an interview, and it is a false statement about
 * ALNANDA published under the client's own name.
 *
 * The page is complete and indexable with this array empty. It renders a "no
 * current openings, send us your CV" state instead of a vacancy list, so the
 * site never displays a role that does not exist.
 *
 * Adding a real opening is one object here and nothing else. The section, the
 * count in the heading, and the apply routes all read from this array, so
 * there is no second list to keep in step.
 *
 * Shape, for when there is a role to add:
 *
 *   {
 *     id: 'field-service-technician',        // slug, unique, used as a key
 *     title: 'Field Service Technician',
 *     discipline: 'maintenance',              // a discipline id from services.js
 *     location: 'Cairo',                      // city only. No "remote-friendly",
 *                                             // no relocation or visa claims.
 *     type: 'Full-time',                      // keep to the plain label
 *     summary: 'One or two sentences on the work itself. No benefits, no salary,
 *               no culture claims - those need confirming before they are
 *               printed, the same as any other claim on this site.',
 *     responsibilities: [
 *       'What the person actually does, one per line.',
 *     ],
 *   }
 *
 * Deliberately not modelled: salary, benefits, equity, leave policy, team size,
 * and "why you'll love working here" copy. Each of those is a commitment the
 * business has to be able to stand behind, and none has been.
 */
export const openRoles = []
