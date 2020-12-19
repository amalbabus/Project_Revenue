const CC = require("currency-converter-lt");

/******************************************************************************* */
exports.revCalculator = (req, res, next) => {
  const projectDetail = req.files.projectDetails;
  const empTime = req.files.employeetime;

  projectDetail.mv("xlsfiles/" + projectDetail.name, (err) => {
    empTime.mv("xlsfiles/" + empTime.name, async (err) => {
      var xlsx = require("xlsx");
      var etBook = xlsx.readFile("./xlsfiles/Employee_Timesheet.xlsx");
      var pdBook = xlsx.readFile("./xlsfiles/Project_Details.xlsx");

      var etSheet = etBook.Sheets["Sheet1"];
      var pdSheet = pdBook.Sheets["Sheet1"];

      var data = xlsx.utils.sheet_to_json(etSheet);
      var data2 = xlsx.utils.sheet_to_json(pdSheet);
      // console.log(data2);

      var fulllist = [];

      for (i = 0; i < data.length; i++) {
        for (j = 0; j < data2.length; j++) {
          var emprevenueall = {};

          if (
            data[i].ProjectName.localeCompare(data2[j].ProjectName) === 0 &&
            data[i].EmployeeName.localeCompare(data2[j].EmployeesWorked) === 0
          ) {
            emprevenue = (data2[j].Rate / 8) * data[i].NoofHoursworked;
            emprevenueall["Name"] = data[i].EmployeeName;
            emprevenueall["revenue"] = emprevenue;
            emprevenueall["ProjectName"] = data[i].ProjectName;

            fulllist.push(emprevenueall);
          }
        }
      }
      console.log(fulllist);

      /************************************************************************ */

      var projectEstimation = [];
      for (i = 0; i < data2.length; i++) {
        var projectEstimationObject = {};
        if (data2[i].Estimation) {
          projectEstimationObject["ProjectName"] = data2[i].ProjectName;
          var price = data2[i].Estimation.split(/(\s+)/);
          let currencyConverter = new CC();
          async function converter(tocurrency) {
            c = await currencyConverter
              .from(price[0])
              .to("INR")
              .amount(tocurrency)
              .convert();
            console.log(c);
            return c;
          }
          if (price[0].localeCompare("INR")) {
            // let currencyConverter = new CC({
            //   from: price[0],
            //   to: "INR",
            //   amount: parseInt(price[2]),
            // });
            // console.log(parseInt(price[1]));
            // console.log(currencyConverter);

            projectEstimationObject["Estimation"] = await converter(
              parseInt(price[2])
            );
          } else {
            projectEstimationObject["Estimation"] = parseInt(
              data2[i].Estimation.split(/(\s+)/)[2]
            );
          }

          projectEstimationObject["OtherExpenses"] = data2[i].OtherExpenses
            ? await converter(
                parseInt(data2[i].OtherExpenses.split(/(\s+)/)[2])
              )
            : 0;
          projectEstimation.push(projectEstimationObject);
        }
      }
      console.log(projectEstimation);
      /********************************************************** */
      projectnameDup = data.map((records) => {
        return records.ProjectName;
      });

      // console.log(projectnameDup);
      const uniqueProjectName = [...new Set(projectnameDup)];

      fullRevenue = [];

      for (projectName of uniqueProjectName) {
        totRevenue = {};
        var totalrevenue = 0;
        for (elements of fulllist) {
          if (projectName.localeCompare(elements.ProjectName)) {
            totalrevenue = totalrevenue + elements.revenue;
            totRevenue["ProjectName"] = projectName;
            totRevenue["price"] = totalrevenue;
          }
        }
        fullRevenue.push(totRevenue);
      }
      console.log(fullRevenue);
      /***************************************************************************** */
      var profitList = [];

      for (item1 of projectEstimation) {
        var profitobject = {};
        for (item2 of fullRevenue) {
          if (item1.ProjectName.localeCompare(item2.ProjectName) === 0) {
            var profit = item1.Estimation - item2.price + item1.OtherExpenses;

            profitobject["ProjectName"] = item1.ProjectName;
            profitobject["Profit"] = profit;
          }
        }
        profitList.push(profitobject);
      }
      console.log(profitList);

      res.render("outputpage", {
        fullRevenue: fullRevenue,
        fulllist: fulllist,
        profitList: profitList,
        projectEstimation: projectEstimation,
      });
    });
  });
};
