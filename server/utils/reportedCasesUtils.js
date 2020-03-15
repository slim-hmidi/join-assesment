const filterByCriteria = (field, criteria) => query => query
  .where(field, criteria).limit(1);

const filterByUnaffectedOfficer = (reportedCaseId, officerId) => query => query
  .patchAndFetchById(
    officerId,
    {
      available: false,
      reported_case_id: reportedCaseId,
    },
  );


const affectCaseToOfficer = async (reportedCaseId, officerId, baseQuery) => {
  const appliedFilter = module.exports.filterByUnaffectedOfficer(reportedCaseId, officerId);
  const affectedCaseToOfficer = await appliedFilter(baseQuery);

  return affectedCaseToOfficer;
};


module.exports = {
  affectCaseToOfficer,
  filterByUnaffectedOfficer,
  filterByCriteria,
};
