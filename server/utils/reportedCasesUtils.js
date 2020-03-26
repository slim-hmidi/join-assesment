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

const formatData = (data) => {
  if (data.constructor === Array && !data.length) return [];
  if (data.constructor === Object && !data) return {};
  if (data.constructor === Array && data.length) {
    return data.map(d => ({
      caseId: d.id,
      name: d.name,
      email: d.email,
      bikeFrameNumber: Number(d.bike_frame_number),
      caseResolved: d.case_resolved ? 1 : 0,
    }));
  }
  return Object.assign({}, {
    caseId: data.id,
    name: data.name,
    email: data.email,
    bikeFrameNumber: data.bike_frame_number,
    caseResolved: data.case_resolved ? 1 : 0,
  });
};


module.exports = {
  formatData,
  affectCaseToOfficer,
  filterByUnaffectedOfficer,
  filterByCriteria,
};
