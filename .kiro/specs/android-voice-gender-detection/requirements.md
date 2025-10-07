# Requirements Document

## Introduction

The English Pronunciation Practice app currently has an issue on Android Chrome where voice gender detection fails, causing all voices to be detected as "unknown" gender and defaulting to female voices. This prevents users from selecting male voices for pronunciation practice, which is essential for learners who want to practice with different voice types. The system needs enhanced Android-specific voice gender detection to properly identify and categorize available voices by gender.

## Requirements

### Requirement 1

**User Story:** As a user on Android Chrome, I want the app to correctly detect male and female voices, so that I can choose my preferred voice gender for pronunciation practice.

#### Acceptance Criteria

1. WHEN the app loads on Android Chrome THEN the system SHALL correctly identify at least 80% of available male voices as "male" gender
2. WHEN the app loads on Android Chrome THEN the system SHALL correctly identify at least 80% of available female voices as "female" gender  
3. WHEN a voice cannot be definitively categorized THEN the system SHALL use intelligent fallback logic based on voice characteristics
4. WHEN the user selects "male" as preferred gender THEN the system SHALL prioritize actual male voices over unknown voices

### Requirement 2

**User Story:** As a user on Android devices, I want the voice selection to work reliably across different Android TTS engines, so that the app functions consistently regardless of my device's TTS configuration.

#### Acceptance Criteria

1. WHEN using Google TTS on Android THEN the system SHALL detect voice genders using Google-specific voice naming patterns
2. WHEN using Samsung TTS on Android THEN the system SHALL detect voice genders using Samsung-specific voice naming patterns
3. WHEN using other Android TTS engines THEN the system SHALL apply generic Android voice detection patterns
4. WHEN multiple TTS engines are available THEN the system SHALL prioritize the most reliable gender detection method

### Requirement 3

**User Story:** As a developer debugging voice issues, I want detailed voice information in the debug panel, so that I can troubleshoot gender detection problems on different Android devices.

#### Acceptance Criteria

1. WHEN the debug panel is opened THEN the system SHALL display the detected gender for each voice with confidence level
2. WHEN the debug panel is opened THEN the system SHALL show the detection method used for each voice (pattern-based, heuristic, etc.)
3. WHEN a voice gender is detected as "unknown" THEN the debug panel SHALL explain why detection failed
4. WHEN testing voices in debug mode THEN the system SHALL log the actual voice characteristics for analysis

### Requirement 4

**User Story:** As a user with accessibility needs, I want the voice gender detection to work with Android accessibility TTS engines, so that I can use the app with my preferred assistive technology.

#### Acceptance Criteria

1. WHEN Android accessibility TTS is enabled THEN the system SHALL detect voice genders from accessibility voice names
2. WHEN using TalkBack or other accessibility services THEN the voice selection SHALL remain functional
3. WHEN accessibility voices have non-standard naming THEN the system SHALL apply accessibility-specific detection patterns
4. IF accessibility voice gender cannot be determined THEN the system SHALL allow manual gender assignment

### Requirement 5

**User Story:** As a user, I want the app to remember my voice preferences even when voice detection improves, so that my settings remain consistent across app updates.

#### Acceptance Criteria

1. WHEN voice detection is improved THEN the system SHALL preserve existing user voice preferences
2. WHEN a previously "unknown" voice is now detected with gender THEN the system SHALL update the detection but keep user selection
3. WHEN the user has manually selected a voice THEN the system SHALL not automatically change it due to detection improvements
4. WHEN voice preferences are migrated THEN the system SHALL maintain backward compatibility with existing stored settings