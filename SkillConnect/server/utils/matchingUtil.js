/**
 * matchingUtil.js
 * -------------------------------------------------------------------
 * Simple, deterministic skill-based job matching (NOT machine learning).
 *
 * Formula:
 *   matchScore = (number of job-required skills the student has / total job-required skills) * 100
 *
 * Mandatory skills are weighted higher than optional ones so a student
 * missing a "must-have" skill scores lower than one missing a "nice-to-have".
 * -------------------------------------------------------------------
 */

const MANDATORY_WEIGHT = 1;
const OPTIONAL_WEIGHT = 0.5;

/**
 * @param {number[]} studentSkillIds - array of skill_id the student has
 * @param {Array<{skill_id:number, is_mandatory:boolean|number}>} jobSkills - required skills for a job
 * @returns {number} matchScore rounded to 2 decimals (0-100)
 */
function calculateMatchScore(studentSkillIds, jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0;

  const studentSet = new Set(studentSkillIds);

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const js of jobSkills) {
    const weight = js.is_mandatory ? MANDATORY_WEIGHT : OPTIONAL_WEIGHT;
    totalWeight += weight;
    if (studentSet.has(js.skill_id)) {
      earnedWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((earnedWeight / totalWeight) * 10000) / 100; // 2 decimal places
}

/**
 * Ranks a list of jobs for a given student by descending match score.
 * @param {number[]} studentSkillIds
 * @param {Array<{id:number, requiredSkills: Array}>} jobsWithSkills
 * @returns {Array} jobs annotated with matchScore, sorted highest first
 */
function rankJobsByMatch(studentSkillIds, jobsWithSkills) {
  return jobsWithSkills
    .map(job => ({
      ...job,
      matchScore: calculateMatchScore(studentSkillIds, job.requiredSkills)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}

module.exports = { calculateMatchScore, rankJobsByMatch };
