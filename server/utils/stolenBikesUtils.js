module.exports.filterByCriteria = (field, criteria) => query => query
  .where(field, criteria).limit(1);
module.exports.filterByUnaffectedOfficer = (bikeId, officerId) => query => query.patchAndFetchById(
  officerId,
  {
    available: false,
    stolen_bike_id: bikeId,
  },
);


module.exports.affectCaseToOfficer = async (bikeId, officerId, baseQuery) => {
  const appliedFilter = module.exports.filterByUnaffectedOfficer(bikeId, officerId);
  const affectedCaseToOfficer = await appliedFilter(baseQuery);

  return affectedCaseToOfficer;
};
