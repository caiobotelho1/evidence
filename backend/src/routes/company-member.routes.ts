import { Router } from "express";
import {requireAuth,requirePermission,} from "../middlewares/authenticate.js";
import {listCompanyMembersController,getCompanyMemberController,removeCompanyMemberController,} from "../controllers/company-member.controller.js";

export const companyMemberRouter = Router({mergeParams: true,});

companyMemberRouter.use(requireAuth);
companyMemberRouter.use(requirePermission("membership:review", {companyParam: "companyId",}));
companyMemberRouter.get("/",listCompanyMembersController);
companyMemberRouter.get("/:membershipId",getCompanyMemberController);
companyMemberRouter.delete("/:membershipId",removeCompanyMemberController);
