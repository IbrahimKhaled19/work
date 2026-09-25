import { Ruler } from '@phosphor-icons/react/Ruler'
import { Wrench } from '@phosphor-icons/react/Wrench'
import { Drop } from '@phosphor-icons/react/Drop'
import { Fire } from '@phosphor-icons/react/Fire'
import { BellRinging } from '@phosphor-icons/react/BellRinging'
import { FireExtinguisher } from '@phosphor-icons/react/FireExtinguisher'
import { Flame } from '@phosphor-icons/react/Flame'
import { Door } from '@phosphor-icons/react/Door'
import { ListChecks } from '@phosphor-icons/react/ListChecks'
import { Certificate } from '@phosphor-icons/react/Certificate'
import { Hammer } from '@phosphor-icons/react/Hammer'
import { Siren } from '@phosphor-icons/react/Siren'
import { GraduationCap } from '@phosphor-icons/react/GraduationCap'

const serviceVisuals = {
  'design-engineering': { proof: 'NFPA 13 · 20', Icon: Ruler },
  'fire-pump-systems': { proof: 'NFPA 20', Icon: Wrench },
  'sprinkler-systems': { proof: 'NFPA 13', Icon: Drop },
  'standpipe-hose-systems': { proof: 'NFPA 14', Icon: Fire },
  'fire-alarm-detection': { proof: 'NFPA 72', Icon: BellRinging },
  'portable-extinguishers': { proof: 'NFPA 10', Icon: FireExtinguisher },
  'special-hazard-suppression': { proof: 'NFPA 2001', Icon: Flame },
  'passive-fire-protection': { proof: 'NFPA 80 · UL', Icon: Door },
  'inspection-testing-maintenance': { proof: 'NFPA 25', Icon: ListChecks },
  'civil-defense-compliance': { proof: 'Civil Defense', Icon: Certificate },
  'retrofit-upgrade': { proof: 'Code Upgrades', Icon: Hammer },
  'emergency-repair-services': { proof: '24/7 Response', Icon: Siren },
  'training-consulting': { proof: 'Staff Training', Icon: GraduationCap },
}

export default serviceVisuals
