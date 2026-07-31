export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  isPrimary: boolean;
  status: "active" | "inactive";
}

/**
 * Every scoped query resolves to one of these:
 *  - a concrete branch id  -> filter `.eq("branch_id", id)`
 *  - "all"                 -> no branch filter (academy-wide, admin only)
 */
export type BranchScope = string | "all";

export const ALL_BRANCHES: BranchScope = "all";

export const isAllBranches = (scope: BranchScope | null | undefined): boolean =>
  !scope || scope === ALL_BRANCHES;
