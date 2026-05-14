/**
 * Utilities for parsing idea metadata from descriptions.
 */

export interface IdeaMetadata {
  techStack?: string
  affectedTeam?: string
  clientIndustry?: string
  [key: string]: string | undefined
}

const METADATA_SEPARATOR = '---METADATA---'

/**
 * Extracts the base description and metadata from a full description string.
 * Metadata is stored as JSON after the separator.
 */
export function parseIdeaDescription(fullDescription: string): {
  description: string
  metadata: IdeaMetadata | null
} {
  if (!fullDescription.includes(METADATA_SEPARATOR)) {
    return {
      description: fullDescription,
      metadata: null,
    }
  }

  const [description, metadataStr] = fullDescription.split(METADATA_SEPARATOR)

  try {
    const metadata = JSON.parse(metadataStr.trim()) as IdeaMetadata
    return {
      description: description.trim(),
      metadata,
    }
  } catch {
    // If parsing fails, return full description
    return {
      description: fullDescription,
      metadata: null,
    }
  }
}

/**
 * Gets a human-readable label for a metadata field.
 */
export function getMetadataLabel(field: string): string {
  const labels: Record<string, string> = {
    techStack: 'Tech Stack',
    affectedTeam: 'Affected Team',
    clientIndustry: 'Client Industry',
  }
  return labels[field] || field
}
