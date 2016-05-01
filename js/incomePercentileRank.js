function incomePercentileRank(form) {
    // Convert Input Variables to Numeric Values
    year = eval(form.year.value); // Year of Interest
    personalIncome = eval(form.personalIncome0.value); // Your Personal Total Money Income
    familyIncome = eval(form.familyIncome1.value); // Your Family's Combined Total Money Income
    householdIncome = eval(form.householdIncome2.value); // Your Household's Combined Total Money Income

    switch(year) { // Year Switch Statement
    case 2010:
    // Individuals - Five-Parameter Logistic (2D)
      PA =  0.03265991;
      PB = 13.05551;
      PC = 12.02696;
      PD =  0.9957467;
      PE =  6.125338;
      Individual = PD + (PA-PD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/PC, PB), PE);
      Individual *= 100;
    // Men - Five-Parameter Logistic (2D)
      MA =  0.03160926;
      MB = 14.66289;
      MC = 11.64009;
      MD =  0.9959404;
      ME =  3.731409;
      Men = MD + (MA-MD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/MC, MB), ME);
      Men *= 100;
    // Women - Five-Parameter Logistic (2D)
      WA =  0.03169715;
      WB = 12.2723;
      WC = 12.53987;
      WD =  0.9978271;
      WE = 11.48654;
      Women = WD + (WA-WD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/WC, WB), WE);
      Women *= 100;
    // Families - Five-Parameter Logistic (2D)
      FA =  0.01704851;
      FB = 16.5829;
      FC = 12.27986;
      FD =  1.000129;
      FE =  4.431561;
      Families = FD + (FA-FD) / Math.pow(1.0 + Math.pow(Math.log(familyIncome)/FC, FB), FE);
      Families *= 100;
    // Households - Five-Parameter Logistic (2D)
      HA =  0.008458493;
      HB = 13.93561;
      HC = 13.1029;
      HD =  0.9979817;
      HE = 10.25528;
      Households = HD + (HA-HD) / Math.pow(1.0 + Math.pow(Math.log(householdIncome)/HC, HB), HE);
      Households *= 100;
    break;
    case 2011:
    // Individuals - Five-Parameter Logistic (2D)
      PA =  3.2659906041609912E-02;
      PB =  1.3055509769861679E+01;
      PC =  1.2026962028480085E+01;
      PD =  9.9574670328209747E-01;
      PE =  6.1253390908789269E+00;
      Individual = PD + (PA-PD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/PC, PB), PE);
      Individual *= 100;
    // Men - Generalized Logistic (2D)
      MA =  9.9730526957865884E-01;
      MC = -9.7381582658567623E-01;
      MM =  1.0578072860833085E+01;
      MB = -1.4798463283070546E+00;
      MT =  4.4729208429203926E-01;
      Men = MA + MC / Math.pow(1 + MT * Math.exp(-MB * (Math.log(personalIncome) - MM)), 1/MT);
      Men *= 100;
    // Women - Generalized Logistic (2D)
      WA =  9.9889667375439828E-01;
      WC = -9.8256193581506701E-01;
      WM =  1.0210790550527921E+01;
      WB = -1.2623348512453219E+00;
      WT =  2.2855882592578908E-01;
      Women = WA + WC / Math.pow(1 + WT * Math.exp(-WB * (Math.log(personalIncome) - WM)), 1/WT);
      Women *= 100;
    // Families - Five-Parameter Logistic (2D)
      FA =  1.7048515094351076E-02;
      FB =  1.6582897950026350E+01;
      FC =  1.2279855163981471E+01;
      FD =  1.0001285617884288E+00;
      FE =  4.4315547032574516E+00;
      Families = FD + (FA-FD) / Math.pow(1.0 + Math.pow(Math.log(familyIncome)/FC, FB), FE);
      Families *= 100;
    // Households - Five-Parameter Logistic (2D)
      HA =  8.4584919421119044E-03;
      HB =  1.3935608671146241E+01;
      HC =  1.3102900052964412E+01;
      HD =  9.9798172310610478E-01;
      HE =  1.0255287803785338E+01;
      Households = HD + (HA-HD) / Math.pow(1.0 + Math.pow(Math.log(householdIncome)/HC, HB), HE);
      Households *= 100;
    break;
    case 2012:
    // Individuals - Five-Parameter Logistic (2D)
      PA =  3.2126378356494373E-02;
      PB =  1.3162003160373018E+01;
      PC =  1.1905360303856384E+01;
      PD =  9.9737787601784067E-01;
      PE =  5.3422143435350620E+00;
      Individual = PD + (PA-PD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/PC, PB), PE);
      Individual *= 100;
    // Men - Generalized Logistic (2D)
      MA =  9.6693394018036224E-03;
      MC =  9.9546198412672660E-01;
      MM =  1.0597274523867888E+01;
      MB =  2.1928367251905048E+00;
      MT =  1.7872993432501243E+00;
      Men = MA + MC / Math.pow(1 + MT * Math.exp(-MB * (Math.log(personalIncome) - MM)), 1/MT);
      Men *= 100;
    // Women - Generalized Logistic (2D)
      WA = -5.7116977855810273E-03;
      WC =  1.0136835890373304E+00;
      WM =  1.0242226530904254E+01;
      WB =  2.3356203330376140E+00;
      WT =  2.3952286380947578E+00;
      Women = WA + WC / Math.pow(1 + WT * Math.exp(-WB * (Math.log(personalIncome) - WM)), 1/WT);
      Women *= 100;
    // Families - Five-Parameter Logistic (2D)
      FA =  1.4774666063539841E-02;
      FB =  1.6150927142107655E+01;
      FC =  1.2543217090746323E+01;
      FD =  9.9969050415641370E-01;
      FE =  5.6864506580537899E+00;
      Families = FD + (FA-FD) / Math.pow(1.0 + Math.pow(Math.log(familyIncome)/FC, FB), FE);
      Families *= 100;
    // Households - Five-Parameter Logistic (2D)
      HA =  5.9017600250009109E-03;
      HB =  1.3682759737855521E+01;
      HC =  1.3586432029121882E+01;
      HD =  9.9731261498328450E-01;
      HE =  1.5467020323227988E+01;
      Households = HD + (HA-HD) / Math.pow(1.0 + Math.pow(Math.log(householdIncome)/HC, HB), HE);
      Households *= 100;
    break;
    case 2013:
    // Individuals - Sigmoid B Modified (2D)
      PA = 1.0048428452462039E+00;
      PB = 1.0803612129544963E+01;
      PC = 4.3988428576785443E-01;
      PD = 4.6011912591000120E-01;
      Individual = PA / Math.pow((1.0 + Math.exp(-(Math.log(personalIncome)-PB)/PC)), PD);
      Individual *= 100;
    // Men - Sigmoid A Modified with Offset (2D)
      MA = 2.2851506677281495E+00;
      MB = 1.0927355788419984E+01;
      MC = 5.1568744407026001E-01;
      MD = 3.5083782765103939E-03;
      Men = 1.0 / Math.pow((1.0 + Math.exp(-MA*(Math.log(personalIncome) - MB))), MC);
      Men *= 100;
    // Women - Weibull (2D)
      WA =  9.9648913633745795E-01;
      WB =  9.8796316442334020E-01;
      WC =  2.5298015126605377E-12;
      WD =  1.1427610539596142E+01;
      Women = WA - WB*Math.exp(-WC*Math.pow(Math.log(personalIncome), WD));
      Women *= 100;
    // Families - Weibull (2D)
      FA =  9.8099962258788098E-01;
      FB =  9.7381026895117240E-01;
      FC =  6.4392290423488173E-17;
      FD =  1.5364887438220455E+01;
      Families = FA - FB*Math.exp(-FC*Math.pow(Math.log(familyIncome), FD));
      Families *= 100;
    // Households - Weibull (2D)
      HA =  9.9070595575900244E-01;
      HB =  9.8922296276913513E-01;
      HC =  1.1829059830313328E-14;
      HD =  1.3295635126271492E+01;
      Households = HA - HB*Math.exp(-HC*Math.pow(Math.log(householdIncome), HD));
      Households *= 100;
    break;
    case 2014:
    // Individuals - Five-Parameter Logistic (2D)
      PA = 0.04567601;
      PB = 13.5361;
      PC = 11.76131;
      PD = 0.9973679;
      PE = 4.431492;
      Individual = PD + (PA-PD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/PC, PB), PE);
      Individual *= 100;
    // Men - Five-Parameter Logistic (2D)
      MA = 0.03736968;
      MB = 15.15954;
      MC = 11.51142;
      MD = 0.9982987;
      ME = 2.975877;
      Men = MD + (MA-MD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/MC, MB), ME);
      Men *= 100;
    // Women - Five-Parameter Logistic (2D)
      WA = 0.04998265;
      WB = 12.65869;
      WC = 12.07929;
      WD = 0.9989587;
      WE = 7.168271;
      Women = WD + (WA-WD) / Math.pow(1.0 + Math.pow(Math.log(personalIncome)/WC, WB), WE);
      Women *= 100;
    // Families - Five-Parameter Logistic (2D)
      FA = 0.01721903;
      FB = 16.07083;
      FC = 12.61554;
      FD = 1.000211;
      FE = 5.562741;
      Families = FD + (FA-FD) / Math.pow(1.0 + Math.pow(Math.log(familyIncome)/FC, FB), FE);
      Families *= 100;
    // Households - Five-Parameter Logistic (2D)
      HA = 0.008095044;
      HB = 13.5723;
      HC = 13.43674;
      HD = 0.9990979;
      HE = 12.12133;
      Households = HD + (HA-HD) / Math.pow(1.0 + Math.pow(Math.log(householdIncome)/HC, HB), HE);
      Households *= 100;
    break;
    } // End Year Switch statement.

    // Output Calculated Values to Form
      form.Individual.value = Individual.toFixed(1);
      form.Men.value = Men.toFixed(1);
      form.Women.value = Women.toFixed(1);
      form.Families.value = Families.toFixed(1);
      form.Households.value = Households.toFixed(1);

} // End incomeRank2011 function.
